// src/App.jsx
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState'
import HomeScreen    from './components/HomeScreen'
import GameScreen    from './components/GameScreen'
import SummaryScreen from './components/SummaryScreen'
import EndScreen     from './components/EndScreen'

const slide = {
  initial:  { opacity: 0, y: 24 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit:     { opacity: 0, y: -16, transition: { duration: 0.2 } },
}

export default function App() {
  const game = useGameState()

  return (
    <AnimatePresence mode="wait">
      {game.screen === 'home' && (
        <motion.div key="home" {...slide} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <HomeScreen game={game} />
        </motion.div>
      )}
      {game.screen === 'game' && (
        <motion.div key={`game-${game.currentLevel}-${game.currentRound}`} {...slide} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <GameScreen game={game} />
        </motion.div>
      )}
      {game.screen === 'summary' && (
        <motion.div key={`summary-${game.currentLevel}`} {...slide} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <SummaryScreen game={game} />
        </motion.div>
      )}
      {game.screen === 'end' && (
        <motion.div key="end" {...slide} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <EndScreen game={game} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
