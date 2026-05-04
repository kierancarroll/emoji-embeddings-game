// src/data/levels.js
// Sequences are NOT hardcoded here anymore.
// They are fetched at runtime from /api/sequence?level=N
// which randomly samples from api/data/stageN.json

export const PASS_THRESHOLD = 0.4  // Minimum score to pass a round. Adjusted for transformed scoring.
export const ROUNDS_PER_LEVEL = 3

export const LEVELS = [
  {
    level: 1,
    name: 'One Feeling',
    tag: 'INTRO',
    description: 'A single emoji. Go with your gut.',
  },
  {
    level: 2,
    name: 'Cause & Effect',
    tag: 'EASY',
    description: 'Two emojis form a relationship.',
  },
  {
    level: 3,
    name: 'Short Story',
    tag: 'MEDIUM',
    description: 'Three emojis — a tiny narrative.',
  },
  {
    level: 4,
    name: 'Scene Setting',
    tag: 'HARD',
    description: 'Four emojis paint a full scene.',
  },
  {
    level: 5,
    name: 'Dense Meaning',
    tag: 'EXPERT',
    description: 'Five emojis, layered intent.',
  },
  {
    level: 6,
    name: 'Maximum Chaos',
    tag: 'CHAOS',
    description: 'Six emojis. Good luck.',
  },
]
