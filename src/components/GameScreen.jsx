// src/components/GameScreen.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LEVELS, PASS_THRESHOLD, ROUNDS_PER_LEVEL } from '../data/levels'
import ScoreMeter from './ScoreMeter'
import styles from './GameScreen.module.css'

export default function GameScreen({ game }) {
  const {
    currentLevel, currentRound, totalScore,
    currentLevelData, currentSequence,
    roundResults, isLoading, error,
    submitAnswer, nextRound, goHome,
  } = game

  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  // Last result (only if it corresponds to current round)
  const lastResult = roundResults[currentRound]
  const hasResult  = !!lastResult

  // Reset input when round changes
  useEffect(() => {
    setInput('')
    if (!hasResult) textareaRef.current?.focus()
  }, [currentRound, currentLevel])

  const handleSubmit = () => {
    if (!input.trim() || isLoading || hasResult) return
    submitAnswer(input.trim())
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (hasResult) nextRound()
      else handleSubmit()
    }
  }

  const progress = ((currentLevel - 1) / LEVELS.length) +
                   ((currentRound) / (ROUNDS_PER_LEVEL * LEVELS.length))

  return (
    <div className={styles.root}>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={goHome} title="Back to home">
          ←
        </button>
        <div className={styles.meta}>
          <span className={styles.metaLabel}>LVL</span>
          <span className={styles.metaVal}>{currentLevel}</span>
        </div>
        <div className={styles.roundDots}>
          {Array.from({ length: ROUNDS_PER_LEVEL }).map((_, i) => (
            <span
              key={i}
              className={`${styles.roundDot}
                ${i < currentRound || (i === currentRound && hasResult) ? styles.dotDone : ''}
                ${i === currentRound && !hasResult ? styles.dotActive : ''}`}
            />
          ))}
        </div>
        <div className={styles.meta} style={{ textAlign: 'right' }}>
          <span className={styles.metaLabel}>PTS</span>
          <span className={styles.metaVal}>{Math.round(totalScore)}</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className={styles.progressTrack}>
        <motion.div
          className={styles.progressFill}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.6, ease: [0.4,0,0.2,1] }}
        />
      </div>

      {/* ── Main game area ── */}
      <div className={styles.body}>
        <div className={styles.levelTag}>
          {currentLevelData?.name} · Round {currentRound + 1}/{ROUNDS_PER_LEVEL}
        </div>

        {/* Emoji display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentLevel}-${currentRound}`}
            className={styles.emojiStage}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <span className={styles.emojiSeq}>{currentSequence?.emoji}</span>
          </motion.div>
        </AnimatePresence>

        <p className={styles.prompt}>What sentence does this express?</p>

        {/* Input area */}
        <div className={styles.inputWrap}>
          <textarea
            ref={textareaRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your interpretation…"
            rows={2}
            disabled={isLoading || hasResult}
            spellCheck={false}
            autoComplete="off"
          />
          <div className={styles.inputFooter}>
            <span className={styles.hint}>⌘↵ to submit</span>
            <button
              className={`${styles.submitBtn} ${isLoading ? styles.loading : ''}`}
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading || hasResult}
            >
              {isLoading ? <Spinner /> : 'Translate →'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div className={styles.errorBanner} initial={{ opacity:0 }} animate={{ opacity:1 }}>
            ⚠ {error} — <button onClick={() => submitAnswer(input)}>retry</button>
          </motion.div>
        )}

        {/* Result card */}
        <AnimatePresence>
          {hasResult && (
            <motion.div
              className={styles.resultCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4,0,0.2,1] }}
            >
              <div className={styles.scoreRow}>
                <div>
                  <div className={styles.scoreLabel}>SIMILARITY SCORE</div>
                  <div className={`${styles.scoreNum} ${lastResult.passed ? styles.pass : styles.fail}`}>
                    {lastResult.score.toFixed(3)}
                  </div>
                </div>
                <div className={`${styles.verdict} ${lastResult.passed ? styles.pass : styles.fail}`}>
                  {lastResult.passed ? '✓ PASS' : '✗ FAIL'}
                </div>
              </div>

              <ScoreMeter score={lastResult.score} passed={lastResult.passed} />

              {lastResult.reasoning && (
                <div className={styles.reasoning}>
                  💬 {lastResult.reasoning}
                </div>
              )}

              <div className={styles.comparison}>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>TARGET</span>
                  <span className={styles.compText}>{lastResult.targetSentence}</span>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>YOURS</span>
                  <span className={styles.compText} style={{ color: 'var(--ink2)' }}>{lastResult.userSentence}</span>
                </div>
              </div>

              <button className={styles.nextBtn} onClick={nextRound}>
                {currentRound >= ROUNDS_PER_LEVEL - 1 ? 'See Summary →' : 'Next Round →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="#000" strokeWidth="2" fill="none" strokeDasharray="28" strokeDashoffset="10" />
    </svg>
  )
}
