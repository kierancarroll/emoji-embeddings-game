// api/translate.js
// Vercel Serverless Function
// 1. Gets Gemini's interpretation of the emoji sequence
// 2. Embeds user sentence + Gemini sentence + target concept
// 3. Returns both scores + Gemini's sentence for UI comparison

async function getEmbeddings(texts, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:batchEmbedContents?key=${apiKey}`,
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

async function getGeminiInterpretation(emojiSequence, apiKey) {
  const prompt = `You are interpreting an emoji sequence as a human would.

Emoji sequence: ${emojiSequence}

Give a short, natural English phrase or sentence (max 8 words) that captures what this emoji sequence means or expresses. Be direct and concise — no explanation, just the interpretation.

Examples of good answers:
- "big business"
- "it is raining outside"
- "I love my dog"

Respond with ONLY the interpretation, nothing else.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 50 }
      })
    }
  )
  if (!res.ok) throw new Error(`Gemini API error: ${await res.text()}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
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

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const [llm1, llm2, llm3] = await Promise.all([
      getGeminiInterpretation(emojiSequence, apiKey),
      getGeminiInterpretation(emojiSequence, apiKey),
      getGeminiInterpretation(emojiSequence, apiKey),
    ])

    const [embUser, embTarget, embLLM1, embLLM2, embLLM3] = await getEmbeddings(
      [userSentence, targetSentence, llm1, llm2, llm3], apiKey
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
      llmScore: parseFloat(llmAvg.toFixed(4)),      // avg of 3 runs
      llmSentence: llm1,                               // show first for display
      llmSentences: [llm1, llm2, llm3],                 // all 3 for UI
      llmScores: [llmScore1, llmScore2, llmScore3],  // individual scores
      llmVariance,                                       // key metric
    })

  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}
