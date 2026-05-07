// src/components/GameScreen.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LEVELS, PASS_THRESHOLD, ROUNDS_PER_LEVEL } from '../data/levels'
import ScoreMeter from './ScoreMeter'
import styles from './GameScreen.module.css'

const STRATEGY_INFO = {
  'Direct': {
    label: 'DIRECT',
    color: 'var(--teal)',
    explanation: 'Each emoji in the sequence directly represents its literal meaning. These are the easiest for both humans and AI to decode.',
  },
  'Metaphorical': {
    label: 'METAPHORICAL',
    color: '#f7c948',
    explanation: 'Emojis are used figuratively — their cultural or symbolic meaning matters more than their literal one and the combination of emojis conveys more information than the emojis by themselves. LLMs often struggle here.',
  },
  'Semantic list': {
    label: 'SEMANTIC LIST',
    color: '#ff9f3e',
    explanation: 'A sequence of related concepts that together hint at a broader idea. Requires understanding the relationship between elements.',
  },
  'Reduplication': {
    label: 'REDUPLICATION',
    color: '#c084fc',
    explanation: 'The same emoji repeated to intensify meaning — like saying something louder. A common human convention that AI often misses.',
  },
  'Single': {
    label: 'SINGLE',
    color: 'var(--teal)',
    explanation: 'A single emoji captures the entire concept on its own. Simple but surprisingly ambiguous — the same emoji can mean very different things in different contexts.',
  },
}

export default function GameScreen({ game }) {
  const {
    currentLevel, currentRound, totalScore,
    currentLevelData, currentSequence,
    roundResults, isLoading, isLoadingSequence, error,
    submitAnswer, nextRound, goHome,
  } = game

  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  const lastResult = roundResults[currentRound]
  const hasResult = !!lastResult

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
    (currentRound / (ROUNDS_PER_LEVEL * LEVELS.length))

  if (isLoadingSequence || !currentSequence) {
    return (
      <div className={styles.root}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={goHome}>←</button>
          <div className={styles.meta}><span className={styles.metaLabel}>LVL</span><span className={styles.metaVal}>{currentLevel}</span></div>
          <div className={styles.meta}><span className={styles.metaLabel}>Loading…</span></div>
          <div className={styles.meta} style={{ textAlign: 'right' }}><span className={styles.metaLabel}>PTS</span><span className={styles.metaVal}>{Math.round(totalScore)}</span></div>
        </div>
        <div className={styles.loadingBody}>
          <div className={styles.loadingSpinner} />
          <span>Fetching sequences…</span>
        </div>
      </div>
    )
  }

  const strategyInfo = STRATEGY_INFO[currentSequence?.strategy] || null

  return (
    <div className={styles.root}>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={goHome} title="Back to home">←</button>
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
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* ── Main game area ── */}
      <div className={styles.body}>
        <div className={styles.levelTag}>
          {currentLevelData?.name} · Round {currentRound + 1}/{ROUNDS_PER_LEVEL}
        </div>

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

        <p className={styles.prompt}>What does this emoji sequence mean?</p>

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
              {isLoading ? <Spinner /> : 'Submit →'}
            </button>
          </div>
        </div>

        {error && (
          <motion.div className={styles.errorBanner} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ⚠ {error} — <button onClick={() => submitAnswer(input)}>retry</button>
          </motion.div>
        )}

        <AnimatePresence>
          {hasResult && (
            <motion.div
              className={styles.resultCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Section 1 — Score comparison */}
              <div className={styles.scoreSection}>
                <div className={styles.scoreCol}>
                  <div className={styles.scoreLabel}>YOU</div>
                  <div className={`${styles.scoreNum} ${lastResult.passed ? styles.pass : styles.fail}`}>
                    {lastResult.userScore.toFixed(3)}
                  </div>
                  <div className={`${styles.verdict} ${lastResult.passed ? styles.pass : styles.fail}`}>
                    {lastResult.passed ? '✓ PASS' : '✗ FAIL'}
                  </div>
                </div>
                <div className={styles.vsLabel}>VS</div>
                <div className={styles.scoreCol}>
                  <div className={styles.scoreLabel}>GEMINI</div>
                  <div className={`${styles.scoreNum} ${lastResult.llmScore >= PASS_THRESHOLD ? styles.pass : styles.fail}`}>
                    {lastResult.llmScore.toFixed(3)}
                  </div>
                  <div className={`${styles.verdict} ${lastResult.userBeatsLLM ? styles.pass : styles.fail}`}>
                    {lastResult.userBeatsLLM ? '🏆 You win' : 'AI wins'}
                  </div>
                </div>
              </div>

              {/* Score meters */}
              <div className={styles.meters}>
                <div className={styles.meterRow}>
                  <span className={styles.meterLabel}>You</span>
                  <ScoreMeter score={lastResult.userScore} passed={lastResult.passed} />
                </div>
                <div className={styles.meterRow}>
                  <span className={styles.meterLabel}>AI</span>
                  <ScoreMeter score={lastResult.llmScore} passed={lastResult.llmScore >= PASS_THRESHOLD} />
                </div>
              </div>

              {/* Section 2 — Sentences */}
              <div className={styles.comparison}>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>TARGET</span>
                  <span className={styles.compText}>{lastResult.targetSentence}</span>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>YOURS</span>
                  <span className={styles.compText} style={{ color: 'var(--ink2)' }}>{lastResult.userSentence}</span>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>GEMINI</span>
                  <span className={styles.compText} style={{ color: 'var(--ink2)' }}>{lastResult.llmSentence}</span>
                </div>
              </div>

              {/* Section 3 — Consistency */}
              {lastResult.llmSentences?.length > 0 && (
                <motion.div
                  className={styles.consistencySection}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className={styles.consistencyLabel}>GEMINI CONSISTENCY — 3 RUNS</div>
                  <div className={styles.consistencyRows}>
                    {lastResult.llmSentences.map((s, i) => (
                      <div key={i} className={styles.consistencyRow}>
                        <span className={styles.runLabel}>Run {i + 1}</span>
                        <span className={styles.runSentence}>{s}</span>
                        <span className={styles.runScore}>{lastResult.llmScores[i].toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.varianceRow}>
                    <span>Variance</span>
                    <span className={`${styles.varianceVal} ${lastResult.llmVariance < 0.005 ? styles.pass : styles.fail}`}>
                      {lastResult.llmVariance.toFixed(4)}
                    </span>
                    <span className={styles.varianceHint}>
                      {lastResult.llmVariance < 0.005 ? '✓ Consistent' : '⚠ Inconsistent'}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Section 4 — Educational layer */}
              {strategyInfo && (
                <motion.div
                  className={styles.eduSection}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className={styles.eduHeader}>
                    <span
                      className={styles.strategyBadge}
                      style={{ color: strategyInfo.color, borderColor: `${strategyInfo.color}44`, background: `${strategyInfo.color}11` }}
                    >
                      {strategyInfo.label}
                    </span>
                    <span className={styles.attributeBadge}>{lastResult.attribute}</span>
                  </div>
                  <p className={styles.eduText}>{strategyInfo.explanation}</p>

                  {lastResult.neighbours?.length > 0 && (
                    <div className={styles.neighbours}>
                      <div className={styles.neighboursLabel}>
                        Other human expressions of "{lastResult.targetSentence}":
                      </div>
                      <div className={styles.neighboursList}>
                        {lastResult.neighbours.slice(0, 6).map((n, i) => (
                          <span key={i} className={styles.neighbourChip}>{n}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

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
