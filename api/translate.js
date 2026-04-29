// api/translate.js
// Vercel Serverless Function — runs on Vercel's servers, never in the browser.
// GEMINI_API_KEY is stored as an env variable in the Vercel dashboard.

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const stage1 = require('./data/stage1.json')
const stage2 = require('./data/stage2.json')
const stage3 = require('./data/stage3.json')
const stage4 = require('./data/stage4.json')
const stage5 = require('./data/stage5.json')
const stage6 = require('./data/stage6.json')

// ── Build lookup map: "emoji sequence" -> "target sentence" ───────
// Covers all stages in one flat map
const sequenceMap = {}
for (const entry of [...stage1, ...stage2, ...stage3, ...stage4, ...stage5, ...stage6]) {
  sequenceMap[entry.emoji] = entry.target
}

// ── Embedding API call ─────────────────────────────────────────────
async function getEmbedding(text, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] }
      })
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Embedding API error: ${err}`)
  }

  const data = await res.json()
  return data.embedding.values  // float[]
}

// ── Cosine similarity (pure math, no LLM) ─────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

// ── Main handler ───────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { emojiSequence, userSentence } = req.body

  if (!emojiSequence || !userSentence) {
    return res.status(400).json({ error: 'Missing emojiSequence or userSentence' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // ── Look up target sentence from dataset ─────────────────────────
  const targetSentence = sequenceMap[emojiSequence]
  if (!targetSentence) {
    return res.status(404).json({ error: `No target found for sequence: ${emojiSequence}` })
  }

  try {
    // ── Embed both sentences in parallel ───────────────────────────
    const [embUser, embTarget] = await Promise.all([
      getEmbedding(userSentence, apiKey),
      getEmbedding(targetSentence, apiKey)
    ])

    // ── Compute cosine similarity ───────────────────────────────────
    const score = cosineSimilarity(embUser, embTarget)

    return res.status(200).json({
      targetSentence,
      score: parseFloat(score.toFixed(4)),
      // no reasoning field anymore — score is purely mathematical
    })

  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
