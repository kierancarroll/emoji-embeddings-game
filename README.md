## EmojiLingo
tbd

### Motivation
tbd

### Methodology
tbd

### Results
tbd

## How to Run

### Prerequisites
- Node.js v20+ (`node --version`)
- A Groq API key → [console.groq.com](https://console.groq.com)
- A Gemini API key → [aistudio.google.com](https://aistudio.google.com)

### Local Development
```bash
git clone https://github.com/kierancarroll/emoji-embeddings-game.git
cd emoji-embeddings-game
npm install
```

### Deployment (Vercel)
0. Create a Vercel account
1. Push (changes) to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Add `GROQ_API_KEY` and `GEMINI_API_KEY` in Vercel → Settings → Environment Variables
4. Deploy — Vercel auto-detects the Vite + serverless setup via `vercel.json`

### Live Demo
[emoji-embeddings-game.vercel.app](https://emoji-embeddings-game.vercel.app)