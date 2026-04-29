// src/data/levels.js

export const PASS_THRESHOLD = 0.65
export const ROUNDS_PER_LEVEL = 3

export const LEVELS = [
  {
    level: 1,
    name: 'One Feeling',
    tag: 'INTRO',
    description: 'A single emoji. Go with your gut.',
    sequences: [
      { emoji: '🌧️', target: 'It is raining outside.' },
      { emoji: '🔥', target: 'This is incredibly exciting or intense.' },
      { emoji: '😴', target: 'I am completely exhausted and need sleep.' },
    ],
  },
  {
    level: 2,
    name: 'Cause & Effect',
    tag: 'EASY',
    description: 'Two emojis form a relationship.',
    sequences: [
      { emoji: '🐶❤️', target: 'I deeply love my dog.' },
      { emoji: '🍕🎉', target: 'We are celebrating with pizza.' },
      { emoji: '💔😤', target: 'I am heartbroken and furious after a breakup.' },
    ],
  },
  {
    level: 3,
    name: 'Short Story',
    tag: 'MEDIUM',
    description: 'Three emojis — a tiny narrative.',
    sequences: [
      { emoji: '🎉🎂🕯️', target: 'Happy birthday, celebrated with a candle-lit cake.' },
      { emoji: '🌧️😢🏠', target: 'Feeling sad and stuck inside on a rainy day.' },
      { emoji: '🌍✈️🗺️', target: 'Travelling the world with a sense of adventure.' },
    ],
  },
  {
    level: 4,
    name: 'Scene Setting',
    tag: 'HARD',
    description: 'Four emojis paint a full scene.',
    sequences: [
      { emoji: '☕📖🌅🐱', target: 'Reading a book with my cat as the sun rises over coffee.' },
      { emoji: '💔😤🚪🌧️', target: 'Storming out the door into the rain after a big fight.' },
      { emoji: '🎵🌙💃🍷', target: 'Dancing and sipping wine under the moonlight.' },
    ],
  },
  {
    level: 5,
    name: 'Dense Meaning',
    tag: 'EXPERT',
    description: 'Five emojis, layered intent.',
    sequences: [
      { emoji: '🧠💡🔬📊✅', target: 'Scientific research leading to a proven breakthrough.' },
      { emoji: '🌱🌿🌳🌍💚', target: 'A tree growing from seed symbolises caring for our planet.' },
      { emoji: '🏃💨🚌⏰😓', target: 'Running frantically and barely catching the bus in time.' },
    ],
  },
  {
    level: 6,
    name: 'Maximum Chaos',
    tag: 'CHAOS',
    description: 'Six emojis. Good luck.',
    sequences: [
      { emoji: '🌊🏄🌞🐠🏝️🍹', target: 'A perfect tropical beach day surfing, swimming, and sipping cocktails.' },
      { emoji: '💼📉😰💊🛋️🌑', target: 'Work burnout spiralling into stress, medication, and sleepless dark nights.' },
      { emoji: '🎓📚🦉🌙☕🔋', target: 'Studying all night fuelled only by coffee, running on empty.' },
    ],
  },
]
