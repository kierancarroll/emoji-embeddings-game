// api/sequence.js
// Returns a random {emoji, target} pair for the requested level.
// The target sentence is only revealed AFTER scoring — never before.

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const stageData = {
  1: require('./data/stage1.json'),
  2: require('./data/stage2.json'),
  3: require('./data/stage3.json'),
  4: require('./data/stage4.json'),
  5: require('./data/stage5.json'),
  6: require('./data/stage6.json'),
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const level = parseInt(req.query.level)

  if (!level || level < 1 || level > 6) {
    return res.status(400).json({ error: 'level must be 1–6' })
  }

  const data = stageData[level]
  const entry = data[Math.floor(Math.random() * data.length)]

  // Only return the emoji — NOT the target yet
  // Target is stored server-side via a session token approach below
  // For simplicity in this version we return both but the frontend
  // must NOT display the target until after scoring
  return res.status(200).json({
    emoji: entry.emoji,
    target: entry.target,  // frontend stores this, sends it back for scoring
  })
}
