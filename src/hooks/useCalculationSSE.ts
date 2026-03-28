import { useReducer, useRef, useCallback } from 'react'
import {
  submitCalculation,
  cancelCalculation,
  getBaseUrl,
  ApiError,
} from '../api/calculationsApi'
import type {
  CalculationRequest,
  CalcStatus,
  ProgressEvent,
  ResultEvent,
  ErrorEvent,
  VolumeRequirement,
  CalculationMetadata,
  FluidType,
  SSEEvent,
} from '../types/calculation'

interface State {
  status: CalcStatus
  calculationId: string | null
  percentage: number
  currentFluidType: FluidType | null
  phase: string | null
  iteration: number
  convergenceMetric: number | null
  volumes: VolumeRequirement[] | null
  metadata: CalculationMetadata | null
  error: ErrorEvent | null
  apiError: string | null
}

type Action =
  | { type: 'SUBMITTING' }
  | { type: 'STREAMING'; calculationId: string }
  | { type: 'PROGRESS'; event: ProgressEvent }
  | { type: 'RESULT'; event: ResultEvent }
  | { type: 'ERROR'; event: ErrorEvent }
  | { type: 'API_ERROR'; message: string }
  | { type: 'RESET' }

const initial: State = {
  status: 'idle',
  calculationId: null,
  percentage: 0,
  currentFluidType: null,
  phase: null,
  iteration: 0,
  convergenceMetric: null,
  volumes: null,
  metadata: null,
  error: null,
  apiError: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SUBMITTING':
      return { ...initial, status: 'submitting' }
    case 'STREAMING':
      return { ...state, status: 'streaming', calculationId: action.calculationId }
    case 'PROGRESS':
      return {
        ...state,
        percentage: action.event.percentage,
        currentFluidType: action.event.currentFluidType,
        phase: action.event.phase,
        iteration: action.event.iteration,
        convergenceMetric: action.event.convergenceMetric,
      }
    case 'RESULT':
      return {
        ...state,
        status: 'done',
        percentage: 100,
        volumes: action.event.volumes,
        metadata: action.event.metadata,
      }
    case 'ERROR':
      return { ...state, status: 'error', error: action.event }
    case 'API_ERROR':
      return { ...state, status: 'error', apiError: action.message }
    case 'RESET':
      return initial
    default:
      return state
  }
}

export function useCalculationSSE() {
  const [state, dispatch] = useReducer(reducer, initial)
  const esRef = useRef<EventSource | null>(null)

  const closeSSE = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
  }, [])

  const start = useCallback(async (req: CalculationRequest) => {
    dispatch({ type: 'SUBMITTING' })
    try {
      const resp = await submitCalculation(req)
      dispatch({ type: 'STREAMING', calculationId: resp.calculationId })

      const url = `${getBaseUrl()}/${resp.calculationId}/progress`
      const es = new EventSource(url)
      esRef.current = es

      es.onmessage = (msg) => {
        let event: SSEEvent
        try {
          event = JSON.parse(msg.data) as SSEEvent
        } catch {
          return
        }
        if (event.type === 'progress') {
          dispatch({ type: 'PROGRESS', event })
        } else if (event.type === 'result') {
          dispatch({ type: 'RESULT', event })
          closeSSE()
        } else if (event.type === 'error') {
          dispatch({ type: 'ERROR', event })
          closeSSE()
        }
      }

      es.onerror = () => {
        dispatch({
          type: 'ERROR',
          event: {
            type: 'error',
            calculationId: resp.calculationId,
            errorCode: 'CONNECTION_LOST',
            errorMessage: 'Lost connection to the server.',
            suggestion: 'Check that the gateway is running and try again.',
          },
        })
        closeSSE()
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to submit calculation.'
      dispatch({ type: 'API_ERROR', message })
    }
  }, [closeSSE])

  const cancel = useCallback(async () => {
    closeSSE()
    if (state.calculationId) {
      await cancelCalculation(state.calculationId).catch(() => {})
    }
    dispatch({ type: 'RESET' })
  }, [closeSSE, state.calculationId])

  const reset = useCallback(() => {
    closeSSE()
    dispatch({ type: 'RESET' })
  }, [closeSSE])

  return { ...state, start, cancel, reset }
}
