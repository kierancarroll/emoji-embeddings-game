// src/components/EndScreen.jsx
import { motion } from 'framer-motion'
import styles from './EndScreen.module.css'

export default function EndScreen({ game }) {
  const { totalScore, restart } = game

  return (
    <div className={styles.root}>
      <div className={styles.starfield} aria-hidden>
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className={styles.star} style={{
            left: `${Math.random() * 100}%`,
            top:  `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            fontSize: `${0.4 + Math.random() * 0.8}rem`,
          }}>✦</span>
        ))}
      </div>

      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <div className={styles.trophy}>🏆</div>
        <h2 className={styles.title}>All Levels Complete!</h2>
        <p className={styles.sub}>You decoded every emoji sequence.</p>

        <div className={styles.scoreBox}>
          <div className={styles.scoreLabel}>FINAL SCORE</div>
          <motion.div
            className={styles.scoreVal}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {Math.round(totalScore)}
          </motion.div>
          <div className={styles.scoreSub}>points earned</div>
        </div>

        <button className={styles.btnRestart} onClick={restart}>
          Play Again
        </button>
      </motion.div>
    </div>
  )
}
