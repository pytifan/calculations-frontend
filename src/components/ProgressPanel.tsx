interface Props {
  percentage: number
  phase: string | null
  iteration: number
  convergenceMetric: number | null
  onCancel: () => void
}

export default function ProgressPanel({ percentage, phase, iteration, convergenceMetric, onCancel }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Calculating…</h2>
        <button
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-red-400 border border-gray-600 hover:border-red-600
                     rounded px-3 py-1.5 transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span className="font-mono text-amber-400">{percentage}%</span>
          </div>
          <progress value={percentage} max={100} />
        </div>

        {/* Phase */}
        {phase && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Phase</span>
            <span className="text-xs font-mono text-amber-400 bg-amber-950 border border-amber-800 rounded px-2 py-0.5">
              {phase.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-500 mb-0.5">Iteration</div>
            <div className="font-mono text-gray-100">{iteration.toLocaleString()}</div>
          </div>
          {convergenceMetric !== null && (
            <div className="bg-gray-800 rounded p-2">
              <div className="text-gray-500 mb-0.5">Convergence</div>
              <div className="font-mono text-gray-100">{convergenceMetric.toExponential(2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
