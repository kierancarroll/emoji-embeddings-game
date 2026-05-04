// src/hooks/useGameState.js
import { useReducer, useCallback } from 'react'
import { LEVELS, PASS_THRESHOLD, ROUNDS_PER_LEVEL } from '../data/levels'

function loadUnlocked() {
  try {
    const s = localStorage.getItem('emojilingo_v2_unlocked')
    return s ? JSON.parse(s) : [1]
  } catch { return [1] }
}
function saveUnlocked(arr) {
  localStorage.setItem('emojilingo_v2_unlocked', JSON.stringify(arr))
}

function init() {
  return {
    screen: 'home',
    currentLevel: 1,
    currentRound: 0,
    roundResults: [],
    totalScore: 0,
    unlockedLevels: loadUnlocked(),
    isLoading: false,
    isLoadingSequence: false,
    error: null,
    currentSequences: [],
  }
}

function reducer(state, action) {
  switch (action.type) {

    case 'START_LEVEL':
      return {
        ...state,
        screen: 'game',
        currentLevel: action.level,
        currentRound: 0,
        roundResults: [],
        currentSequences: [],
        isLoading: false,
        isLoadingSequence: true,
        error: null,
      }

    case 'SEQUENCES_LOADED':
      return {
        ...state,
        isLoadingSequence: false,
        currentSequences: action.sequences,
      }

    case 'SEQUENCES_ERROR':
      return { ...state, isLoadingSequence: false, error: action.message }

    case 'SUBMIT_START':
      return { ...state, isLoading: true, error: null }

    case 'SUBMIT_SUCCESS': {
      const { userSentence, targetSentence, userScore, llmScore, llmSentence } = action
      const passed = userScore >= PASS_THRESHOLD
      const pointsEarned = passed ? Math.round(userScore * 100) : Math.round(userScore * 25)
      const seq = state.currentSequences[state.currentRound]

      return {
        ...state,
        isLoading: false,
        roundResults: [
          ...state.roundResults,
          {
            emoji:          seq?.emoji,
            userSentence,
            targetSentence,
            userScore,
            llmScore,
            llmSentence,
            passed,
            pointsEarned,
            strategy:       seq?.strategy,
            attribute:      seq?.attribute,
            neighbours:     seq?.neighbours || [],
            userBeatsLLM:   userScore > llmScore,
          }
        ],
        totalScore: state.totalScore + pointsEarned,
      }
    }

    case 'SUBMIT_ERROR':
      return { ...state, isLoading: false, error: action.message }

    case 'NEXT_ROUND': {
      const nextRound = state.currentRound + 1
      if (nextRound >= ROUNDS_PER_LEVEL) {
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

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, init)

  const fetchSequences = useCallback(async (level) => {
    try {
      const results = await Promise.all(
        Array.from({ length: ROUNDS_PER_LEVEL }, () =>
          fetch(`/api/sequence?level=${level}`).then(r => r.json())
        )
      )
      dispatch({ type: 'SEQUENCES_LOADED', sequences: results })
    } catch (err) {
      dispatch({ type: 'SEQUENCES_ERROR', message: err.message })
    }
  }, [])

  const startLevel = useCallback((level) => {
    dispatch({ type: 'START_LEVEL', level })
    fetchSequences(level)
  }, [fetchSequences])

  const submitAnswer = useCallback(async (userSentence) => {
    const currentSeq = state.currentSequences[state.currentRound]
    if (!currentSeq) return

    dispatch({ type: 'SUBMIT_START' })

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSentence,
          targetSentence: currentSeq.target,
          emojiSequence:  currentSeq.emoji,
        }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()

      dispatch({
        type: 'SUBMIT_SUCCESS',
        userSentence,
        targetSentence: data.targetSentence,
        userScore:      data.userScore,
        llmScore:       data.llmScore,
        llmSentence:    data.llmSentence,
      })
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', message: err.message })
    }
  }, [state.currentSequences, state.currentRound])

  const nextRound = useCallback(() => dispatch({ type: 'NEXT_ROUND' }), [])
  const goHome    = useCallback(() => dispatch({ type: 'GO_HOME' }), [])
  const restart   = useCallback(() => dispatch({ type: 'RESTART' }), [])

  const currentLevelData = LEVELS.find(l => l.level === state.currentLevel)
  const currentSequence  = state.currentSequences[state.currentRound]

  return {
    ...state,
    currentLevelData,
    currentSequence,
    startLevel,
    submitAnswer,
    nextRound,
    goHome,
    restart,
  }
}
