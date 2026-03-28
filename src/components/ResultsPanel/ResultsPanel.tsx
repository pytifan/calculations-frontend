import { FLUID_LABELS, FLUID_COLORS } from '../WellVisualization/fluidColors'
import type { VolumeRequirement, CalculationMetadata } from '../../types/calculation'

interface Props {
  volumes: VolumeRequirement[]
  metadata: CalculationMetadata
  onReset: () => void
}

function formatElapsed(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`
}

export default function ResultsPanel({ volumes, metadata, onReset }: Props) {
  const totalM3  = volumes.reduce((s, v) => s + v.volumeM3, 0)
  const totalBbl = volumes.reduce((s, v) => s + v.volumeBbl, 0)
  const totalGal = volumes.reduce((s, v) => s + v.volumeGal, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Results</h2>
        <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-950 border border-green-800 rounded px-2 py-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
          Converged
        </span>
      </div>

      {/* Volume Table */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Fluid</th>
              <th className="text-right px-4 py-2.5 text-xs text-gray-400 font-medium">m³</th>
              <th className="text-right px-4 py-2.5 text-xs text-gray-400 font-medium">bbl</th>
              <th className="text-right px-4 py-2.5 text-xs text-gray-400 font-medium">gal</th>
            </tr>
          </thead>
          <tbody>
            {volumes.map((v) => (
              <tr key={v.fluidType} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: FLUID_COLORS[v.fluidType] ?? '#37474F' }}
                    />
                    <span className="text-gray-200">{FLUID_LABELS[v.fluidType] ?? v.fluidType}</span>
                  </div>
                  {v.description && (
                    <div className="text-xs text-gray-500 ml-4.5 mt-0.5">{v.description}</div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-gray-200">{v.volumeM3.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-gray-300">{v.volumeBbl.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-gray-400">{v.volumeGal.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
          {volumes.length > 1 && (
            <tfoot>
              <tr className="bg-gray-800/50">
                <td className="px-4 py-2.5 text-xs font-semibold text-gray-400">Total</td>
                <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-amber-400">{totalM3.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-gray-300">{totalBbl.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-gray-400">{totalGal.toFixed(1)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Metadata */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Solver Metadata</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Algorithm', value: metadata.algorithmUsed },
            { label: 'Unit System', value: metadata.unitSystem },
            { label: 'Iterations', value: metadata.iterations.toLocaleString() },
            { label: 'Elapsed', value: formatElapsed(metadata.elapsedMs) },
            { label: 'Convergence', value: metadata.finalConvergence.toExponential(3) },
            { label: 'Converged', value: metadata.converged ? '✓ Yes' : '✗ No' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-800 rounded p-2">
              <div className="text-gray-500 mb-0.5">{label}</div>
              <div className="font-mono text-gray-100">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full border border-gray-600 hover:border-amber-500 hover:text-amber-400
                   text-gray-300 font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        New Calculation
      </button>
    </div>
  )
}
