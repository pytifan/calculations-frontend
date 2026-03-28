import type { ErrorEvent } from '../types/calculation'

interface Props {
  error: ErrorEvent | null
  apiError: string | null
  onReset: () => void
}

export default function ErrorPanel({ error, apiError, onReset }: Props) {
  const code    = error?.errorCode ?? 'ERROR'
  const message = error?.errorMessage ?? apiError ?? 'An unexpected error occurred.'
  const suggestion = error?.suggestion

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-100">Calculation Failed</h2>

      <div className="bg-red-950 border border-red-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-red-900 text-red-300 border border-red-700 rounded px-2 py-0.5">
            {code}
          </span>
        </div>
        <p className="text-sm text-red-200">{message}</p>

        {suggestion && (
          <div className="bg-red-900/50 border border-red-700 rounded p-3 text-xs text-red-300">
            <span className="font-semibold text-red-200">Suggestion: </span>
            {suggestion}
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500
                   text-gray-200 font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        Try Again
      </button>
    </div>
  )
}
