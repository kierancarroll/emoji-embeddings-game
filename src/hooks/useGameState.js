// src/hooks/useGameState.js
import { useReducer, useCallback } from 'react'
import { LEVELS, PASS_THRESHOLD, ROUNDS_PER_LEVEL } from '../data/levels'

// ── helpers ──────────────────────────────────────────────────────
function loadUnlocked() {
  try {
    const s = localStorage.getItem('emojilingo_v2_unlocked')
    return s ? JSON.parse(s) : [1]
  } catch { return [1] }
}
function saveUnlocked(arr) {
  localStorage.setItem('emojilingo_v2_unlocked', JSON.stringify(arr))
}

// ── initial state ─────────────────────────────────────────────────
function init() {
  return {
    screen: 'home',          // 'home' | 'game' | 'summary' | 'end'
    currentLevel: 1,
    currentRound: 0,
    roundResults: [],        // [{emoji, userSentence, targetSentence, score, passed, reasoning}]
    totalScore: 0,
    unlockedLevels: loadUnlocked(),
    isLoading: false,
    error: null,
  }
}

// ── reducer ───────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'START_LEVEL':
      return {
        ...state,
        screen: 'game',
        currentLevel: action.level,
        currentRound: 0,
        roundResults: [],
        isLoading: false,
        error: null,
      }

    case 'SUBMIT_START':
      return { ...state, isLoading: true, error: null }

    case 'SUBMIT_SUCCESS': {
      const { userSentence, targetSentence, score, reasoning } = action
      const passed = score >= PASS_THRESHOLD
      const pointsEarned = passed
        ? Math.round(score * 100)
        : Math.round(score * 25)
      const level = LEVELS.find(l => l.level === state.currentLevel)
      const emoji = level.sequences[state.currentRound].emoji

      return {
        ...state,
        isLoading: false,
        roundResults: [
          ...state.roundResults,
          { emoji, userSentence, targetSentence, score, passed, reasoning, pointsEarned }
        ],
        totalScore: state.totalScore + pointsEarned,
      }
    }

    case 'SUBMIT_ERROR':
      return { ...state, isLoading: false, error: action.message }

    case 'NEXT_ROUND': {
      const nextRound = state.currentRound + 1
      if (nextRound >= ROUNDS_PER_LEVEL) {
        // unlock next level
        const next = state.currentLevel + 1
        const unlocked = state.unlockedLevels.includes(next)
          ? state.unlockedLevels
          : [...state.unlockedLevels, next]
        saveUnlocked(unlocked)
        return {
          ...state,
          screen: state.currentLevel >= 6 ? 'end' : 'summary',
          unlockedLevels: unlocked,
        }
      }
      return { ...state, currentRound: nextRound, error: null }
    }

    case 'GO_HOME':
      return { ...state, screen: 'home' }

    case 'RESTART':
      return { ...init(), unlockedLevels: state.unlockedLevels }

    default:
      return state
  }
}

// ── hook ──────────────────────────────────────────────────────────
export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, init)

  const startLevel = useCallback((level) => {
    dispatch({ type: 'START_LEVEL', level })
  }, [])

  const submitAnswer = useCallback(async (userSentence) => {
    const level = LEVELS.find(l => l.level === state.currentLevel)
    const { emoji } = level.sequences[state.currentRound]

    dispatch({ type: 'SUBMIT_START' })

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emojiSequence: emoji, userSentence }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()

      dispatch({
        type: 'SUBMIT_SUCCESS',
        userSentence,
        targetSentence: data.targetSentence,
        score: data.score,
        reasoning: data.reasoning,
      })
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', message: err.message })
    }
  }, [state.currentLevel, state.currentRound])

  const nextRound    = useCallback(() => dispatch({ type: 'NEXT_ROUND' }), [])
  const goHome       = useCallback(() => dispatch({ type: 'GO_HOME' }), [])
  const restart      = useCallback(() => dispatch({ type: 'RESTART' }), [])

  // derived
  const currentLevelData  = LEVELS.find(l => l.level === state.currentLevel)
  const currentSequence   = currentLevelData?.sequences[state.currentRound]
  const lastResult        = state.roundResults[state.roundResults.length - 1]
  const hasResult         = state.roundResults.length > state.currentRound ||
                            (state.screen === 'game' && lastResult &&
                             state.roundResults.length === state.currentRound + 1)

  return {
    ...state,
    currentLevelData,
    currentSequence,
    lastResult,
    hasResult: state.roundResults.length > state.currentRound,
    startLevel,
    submitAnswer,
    nextRound,
    goHome,
    restart,
  }
}
