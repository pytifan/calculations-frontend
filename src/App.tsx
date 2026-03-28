import { useEffect, useState } from 'react'
import { fetchServiceInfo } from './api/calculationsApi'
import { useCalculationSSE } from './hooks/useCalculationSSE'
import WellVisualization from './components/WellVisualization/WellVisualization'
import CalculationForm from './components/CalculationForm/CalculationForm'
import ProgressPanel from './components/ProgressPanel'
import ResultsPanel from './components/ResultsPanel/ResultsPanel'
import ErrorPanel from './components/ErrorPanel'
import type { ServiceInfo } from './types/calculation'

export default function App() {
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null)
  const calc = useCalculationSSE()

  useEffect(() => {
    fetchServiceInfo().then(setServiceInfo).catch(() => {})
  }, [])

  const maxEquations = serviceInfo?.limits.maxEquationsPerRequest ?? 50

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* ── NAV ── */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-500 fill-current" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
          <span className="font-bold text-amber-400 tracking-wide text-sm uppercase">
            Oil &amp; Gas Field Calculations
          </span>
        </div>
        {serviceInfo && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>API {serviceInfo.apiVersion}</span>
            <a
              href="/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="text-amber-600 hover:text-amber-400 transition-colors"
            >
              API Docs ↗
            </a>
          </div>
        )}
      </nav>

      {/* ── SERVICE INFO BAR ── */}
      {serviceInfo && (
        <div className="bg-gray-900/50 border-b border-gray-800 px-6 py-2 flex items-center gap-4 flex-wrap text-xs text-gray-500 flex-shrink-0">
          <span className="text-gray-600">Fluids:</span>
          {serviceInfo.supportedFluids.map((f) => (
            <span key={f} className="bg-gray-800 text-gray-400 rounded px-2 py-0.5 font-mono">{f}</span>
          ))}
          <span className="text-gray-700 ml-2">|</span>
          <span className="text-gray-600">Solvers:</span>
          {serviceInfo.solverMethods.map((s) => (
            <span key={s} className="bg-gray-800 text-gray-400 rounded px-2 py-0.5 font-mono">{s}</span>
          ))}
          <span className="text-gray-700 ml-2">|</span>
          <span>Max {serviceInfo.limits.maxConcurrentCalculations} concurrent · {serviceInfo.limits.calculationTimeoutSeconds}s timeout</span>
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <main className="flex flex-1 overflow-hidden">

        {/* LEFT: Well visualization (sticky sidebar) */}
        <aside className="w-44 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-6 px-3 gap-4 sticky top-0 h-screen overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider self-start">
            Well Bore
          </p>
          <WellVisualization
            percentage={calc.percentage}
            currentFluidType={calc.currentFluidType}
            phase={calc.phase}
            volumes={calc.volumes}
            status={calc.status}
          />
        </aside>

        {/* RIGHT: Dynamic content */}
        <section className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto">

            {(calc.status === 'idle' || calc.status === 'submitting') && (
              <CalculationForm
                onSubmit={calc.start}
                disabled={calc.status === 'submitting'}
                maxEquations={maxEquations}
              />
            )}

            {calc.status === 'streaming' && (
              <ProgressPanel
                percentage={calc.percentage}
                phase={calc.phase}
                iteration={calc.iteration}
                convergenceMetric={calc.convergenceMetric}
                onCancel={calc.cancel}
              />
            )}

            {calc.status === 'done' && calc.volumes && calc.metadata && (
              <ResultsPanel
                volumes={calc.volumes}
                metadata={calc.metadata}
                onReset={calc.reset}
              />
            )}

            {calc.status === 'error' && (
              <ErrorPanel
                error={calc.error}
                apiError={calc.apiError}
                onReset={calc.reset}
              />
            )}

          </div>
        </section>
      </main>
    </div>
  )
}
