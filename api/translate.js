// api/translate.js
// Vercel Serverless Function — runs on Vercel's servers, never in the browser.
// GEMINI_API_KEY is stored as an env variable in the Vercel dashboard.

async function getEmbedding(text, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] }
      })
    }
  )
  if (!res.ok) throw new Error(`Embedding API error: ${await res.text()}`)
  const data = await res.json()
  return data.embedding.values
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

  const { userSentence, targetSentence } = req.body

  if (!userSentence || !targetSentence) {
    return res.status(400).json({ error: 'Missing userSentence or targetSentence' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const [embUser, embTarget] = await Promise.all([
      getEmbedding(userSentence, apiKey),
      getEmbedding(targetSentence, apiKey)
    ])

    const score = cosineSimilarity(embUser, embTarget)

    return res.status(200).json({
      targetSentence,
      score: parseFloat(score.toFixed(4))
    })

  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}
