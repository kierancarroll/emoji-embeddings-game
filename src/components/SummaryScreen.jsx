// src/components/SummaryScreen.jsx
import { motion } from 'framer-motion'
import { PASS_THRESHOLD } from '../data/levels'
import ScoreMeter from './ScoreMeter'
import styles from './SummaryScreen.module.css'

export default function SummaryScreen({ game }) {
  const { currentLevel, roundResults, totalScore, startLevel, goHome } = game

  const avg = roundResults.reduce((s, r) => s + r.userScore, 0) / roundResults.length
  const passed = roundResults.filter(r => r.passed).length
  const allPass = passed === roundResults.length
  const nextLevel = currentLevel + 1

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className={styles.icon}
        >
          {allPass ? '🏆' : passed >= 2 ? '🎯' : '📈'}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <div className={styles.levelTag}>LEVEL {currentLevel} COMPLETE</div>
          <h2 className={styles.title}>
            {allPass ? 'Flawless!' : passed >= 2 ? 'Well done!' : 'Keep going!'}
          </h2>
          <p className={styles.sub}>{passed}/{roundResults.length} rounds passed</p>
        </motion.div>

        {/* Round breakdown */}
        <motion.div
          className={styles.rounds}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.35 }}
        >
          {roundResults.map((r, i) => (
            <div key={i} className={`${styles.roundRow} ${r.passed ? styles.pass : styles.fail}`}>
              <span className={styles.roundEmoji}>{r.emoji}</span>
              <div className={styles.roundMid}>
                <div className={styles.roundUserText}>"{r.userSentence.slice(0, 48)}{r.userSentence.length > 48 ? '…' : ''}"</div>
                <div className={styles.roundTarget}>{r.targetSentence}</div>
              </div>
              <div className={styles.roundScore}>
                <span className={r.passed ? styles.passText : styles.failText}>
                  {r.userScore.toFixed(3)}
                </span>
                <span className={styles.roundVerdict}>{r.passed ? 'PASS' : 'FAIL'}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Avg score */}
        <motion.div
          className={styles.avgBox}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.35 }}
        >
          <div className={styles.avgLabel}>AVG SIMILARITY</div>
          <div className={`${styles.avgVal} ${avg >= PASS_THRESHOLD ? styles.passText : styles.failText}`}>
            {avg.toFixed(3)}
          </div>
          <div style={{ width: '100%', marginTop: '0.5rem' }}>
            <ScoreMeter score={avg} passed={avg >= PASS_THRESHOLD} />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
        >
          <button className={styles.btnNext} onClick={() => startLevel(nextLevel)}>
            Level {nextLevel} →
          </button>
          <button className={styles.btnHome} onClick={goHome}>← Home</button>
        </motion.div>
      </div>
    </div>
  )
}
