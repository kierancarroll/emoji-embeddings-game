// api/translate.js
// Vercel Serverless Function
// Text generation: Groq (fast, generous quota)
// Embeddings:      Gemini (separate quota)

async function getEmbeddings(texts, geminiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:batchEmbedContents?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: texts.map(text => ({
          model: 'models/gemini-embedding-2',
          content: { parts: [{ text }] }
        }))
      })
    }
  )
  if (!res.ok) throw new Error(`Embedding API error: ${await res.text()}`)
  const data = await res.json()
  return data.embeddings.map(e => e.values)
}

async function getLLMInterpretation(emojiSequence, groqKey) {
  const prompt = `You are interpreting an emoji sequence.

Emoji sequence: ${emojiSequence}

Give a short, natural English adjective noun composition (max 2 words) that captures what this emoji sequence means or expresses. Be direct and concise — no explanation, just the interpretation.

Respond with ONLY the interpretation, nothing else.`

  const res = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.3
      })
    }
  )
  if (!res.ok) throw new Error(`Groq API error: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userSentence, targetSentence, emojiSequence } = req.body

  if (!userSentence || !targetSentence || !emojiSequence) {
    return res.status(400).json({ error: 'Missing userSentence, targetSentence, or emojiSequence' })
  }

  // Vercel reads these automatically from environment variables
  const geminiKey = process.env.GEMINI_API_KEY
  const groqKey = process.env.GROQ_API_KEY

  if (!geminiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  if (!groqKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured' })

  try {
    // 3x LLM interpretations in parallel via Groq
    const [llm1, llm2, llm3] = await Promise.all([
      getLLMInterpretation(emojiSequence, groqKey),
      getLLMInterpretation(emojiSequence, groqKey),
      getLLMInterpretation(emojiSequence, groqKey),
    ])

    // Batch embed all 5 in one Gemini call
    const [embUser, embTarget, embLLM1, embLLM2, embLLM3] = await getEmbeddings(
      [userSentence, targetSentence, llm1, llm2, llm3],
      geminiKey
    )

    const userScore = cosineSimilarity(embUser, embTarget)
    const llmScore1 = cosineSimilarity(embLLM1, embTarget)
    const llmScore2 = cosineSimilarity(embLLM2, embTarget)
    const llmScore3 = cosineSimilarity(embLLM3, embTarget)
    const llmAvg = (llmScore1 + llmScore2 + llmScore3) / 3
    const llmVariance = parseFloat(
      (((llmScore1 - llmAvg) ** 2 + (llmScore2 - llmAvg) ** 2 + (llmScore3 - llmAvg) ** 2) / 3).toFixed(4)
    )

    return res.status(200).json({
      targetSentence,
      userScore: parseFloat(userScore.toFixed(4)),
      llmScore: parseFloat(llmAvg.toFixed(4)),
      llmSentence: llm1,
      llmSentences: [llm1, llm2, llm3],
      llmScores: [llmScore1, llmScore2, llmScore3],
      llmVariance,
    })

  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}
