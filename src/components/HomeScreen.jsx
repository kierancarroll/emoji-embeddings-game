// src/components/HomeScreen.jsx
import { motion } from 'framer-motion'
import { LEVELS } from '../data/levels'
import styles from './HomeScreen.module.css'

const tagColors = {
  INTRO:  'var(--teal)',
  EASY:   'var(--lime)',
  MEDIUM: '#f7c948',
  HARD:   '#ff9f3e',
  EXPERT: 'var(--coral)',
  CHAOS:  '#c084fc',
}

export default function HomeScreen({ game }) {
  const { unlockedLevels, totalScore, startLevel } = game

  // Find the next unplayed level to highlight for the CTA
  const nextLevel = LEVELS.find(l => unlockedLevels.includes(l.level)) || LEVELS[0]

  return (
    <div className={styles.root}>
      {/* Animated grid background */}
      <div className={styles.grid} aria-hidden />
      <div className={styles.glow} aria-hidden />

      <div className={styles.inner}>
        {/* Header */}
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className={styles.badge}>NLP · LANGUAGE GAME · v0.1</div>
          <h1 className={styles.title}>
            Emoji<span className={styles.accent}>Lingo</span>
          </h1>
          <p className={styles.sub}>
            Decode emoji sequences into natural language.<br />
            Scored by semantic similarity — not exact match.
          </p>
          {totalScore > 0 && (
            <div className={styles.scoreChip}>
              <span className={styles.scoreLabel}>YOUR SCORE</span>
              <span className={styles.scoreVal}>{Math.round(totalScore)}</span>
            </div>
          )}
        </motion.div>

        {/* Level grid */}
        <motion.div
          className={styles.levelGrid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {LEVELS.map((lvl, i) => {
            const unlocked  = unlockedLevels.includes(lvl.level)
            const completed = unlockedLevels.includes(lvl.level + 1) ||
                              (lvl.level === 6 && unlockedLevels.includes(7))
            const color = tagColors[lvl.tag]

            return (
              <motion.button
                key={lvl.level}
                className={`${styles.levelCard} ${unlocked ? styles.unlocked : styles.locked} ${completed ? styles.completed : ''}`}
                onClick={() => unlocked && startLevel(lvl.level)}
                disabled={!unlocked}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                whileHover={unlocked ? { y: -3, scale: 1.02 } : {}}
                whileTap={unlocked ? { scale: 0.97 } : {}}
              >
                <div className={styles.cardTop}>
                  <span className={styles.lvlNum}>{lvl.level}</span>
                  <span className={styles.lvlTag} style={{ color, borderColor: `${color}33`, background: `${color}11` }}>
                    {lvl.tag}
                  </span>
                </div>
                <div className={styles.lvlName}>{lvl.name}</div>
                <div className={styles.lvlDesc}>{lvl.description}</div>
                <div className={styles.emojiDots}>
                  {Array.from({ length: lvl.level }).map((_, j) => (
                    <span key={j} className={styles.dot} style={{ background: color }} />
                  ))}
                </div>
                {!unlocked && <div className={styles.lockIcon}>🔒</div>}
                {completed && <div className={styles.checkIcon}>✓</div>}
              </motion.button>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
        >
          <button className={styles.btnStart} onClick={() => startLevel(nextLevel.level)}>
            {totalScore > 0 ? `Continue → Level ${nextLevel.level}` : 'Start Playing'}
          </button>
          <p className={styles.ctaHint}>Pass threshold: 0.65 cosine similarity</p>
        </motion.div>
      </div>
    </div>
  )
}
