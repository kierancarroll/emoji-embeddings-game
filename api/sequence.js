// api/sequence.js
// Returns a random sequence for the requested level.
// Includes strategy + neighbours for the educational UI layer.

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

  return res.status(200).json({
    emoji:      entry.emoji,
    target:     entry.target,
    strategy:   entry.strategy,   // Direct | Metaphorical | Semantic list | Reduplication
    attribute:  entry.attribute,  // SIZE | TEMPERATURE | etc.
    neighbours: entry.neighbours, // other human emoji translations of same concept
  })
}
