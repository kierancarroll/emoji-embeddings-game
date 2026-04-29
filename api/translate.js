// api/translate.js
// Vercel Serverless Function — runs on Vercel's servers, never in the browser.
// The GEMINI_API_KEY is stored as an env variable in the Vercel dashboard.

export default async function handler(req, res) {
  // Only allow POST
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

  try {
    // ── STEP 1: Ask Gemini for the target sentence + score ──────────
    const prompt = `You are evaluating an emoji translation game.

Emoji sequence: ${emojiSequence}

The player's translation: "${userSentence}"

Your tasks:
1. Write a natural, fluent English sentence that best captures the meaning of the emoji sequence (the "target sentence"). Be creative but grounded — the sentence should feel like something a person might actually say or think.
2. Score the player's translation against your target sentence using semantic similarity. Consider meaning, tone, and intent — not just word overlap. Return a score from 0.0 to 1.0.

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "targetSentence": "...",
  "score": 0.00,
  "reasoning": "one short sentence explaining the score"
}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      console.error('Gemini error:', err)
      return res.status(502).json({ error: 'Gemini API error' })
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Strip markdown fences if Gemini wraps in ```json
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return res.status(200).json({
      targetSentence: parsed.targetSentence,
      score: Math.min(1, Math.max(0, parseFloat(parsed.score))),
      reasoning: parsed.reasoning || ''
    })

  } catch (err) {
    console.error('Handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
