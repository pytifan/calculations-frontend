import { useState } from 'react'
import WellConfigSection from './WellConfigSection'
import type { CalculationRequest, WellConfig, SolverMethod, UnitSystem } from '../../types/calculation'

interface Props {
  onSubmit: (req: CalculationRequest) => void
  disabled: boolean
  maxEquations?: number
}

const inputCls =
  'w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 ' +
  'focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors'

const sectionCls = 'bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3'

export default function CalculationForm({ onSubmit, disabled, maxEquations = 50 }: Props) {
  const [equations, setEquations] = useState<string[]>(['x**2 + y**2 - 1', 'x - y'])
  const [initialParams, setInitialParams] = useState('1.0, 1.0')
  const [solverMethod, setSolverMethod] = useState<SolverMethod>('hybr')
  const [maxIterations, setMaxIterations] = useState(1000)
  const [tolerance, setTolerance] = useState('1e-8')
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
  const [useWellConfig, setUseWellConfig] = useState(false)
  const [wellConfig, setWellConfig] = useState<Partial<WellConfig>>({
    fluidType: 'drilling_mud',
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const setEquation = (i: number, val: string) => {
    const next = [...equations]
    next[i] = val
    setEquations(next)
  }

  const addEquation = () => {
    if (equations.length < maxEquations) setEquations([...equations, ''])
  }

  const removeEquation = (i: number) => {
    if (equations.length > 1) setEquations(equations.filter((_, idx) => idx !== i))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const eqs = equations.map((eq) => eq.trim()).filter(Boolean)
    if (eqs.length === 0) {
      setValidationError('At least one equation is required.')
      return
    }

    const params = initialParams
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n))

    if (params.length === 0) {
      setValidationError('At least one initial parameter is required.')
      return
    }

    const tol = parseFloat(tolerance)
    if (isNaN(tol) || tol <= 0) {
      setValidationError('Tolerance must be a positive number (e.g. 1e-8).')
      return
    }

    if (useWellConfig) {
      const wc = wellConfig
      if (!wc.wellName || !wc.fieldName || !wc.depthMeters || !wc.diameterInches || !wc.fluidType) {
        setValidationError('All well configuration fields are required when well config is enabled.')
        return
      }
    }

    const req: CalculationRequest = {
      equations: eqs,
      initialParameters: params,
      options: { solverMethod, maxIterations, tolerance: tol, unitSystem },
      wellConfig: useWellConfig ? (wellConfig as WellConfig) : undefined,
    }

    onSubmit(req)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-100">New Calculation</h2>

      {/* Equations */}
      <div className={sectionCls}>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Equations</h3>
        <div className="space-y-2">
          {equations.map((eq, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-gray-500 text-xs font-mono w-4 flex-shrink-0">{i + 1}</span>
              <input
                type="text"
                className={inputCls}
                value={eq}
                placeholder={`e.g. x**2 + y**2 - 1`}
                onChange={(e) => setEquation(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeEquation(i)}
                disabled={equations.length === 1}
                className="text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors text-lg leading-none px-1"
                aria-label="Remove equation"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addEquation}
          disabled={equations.length >= maxEquations}
          className="text-xs text-amber-500 hover:text-amber-400 disabled:opacity-30 transition-colors"
        >
          + Add equation
        </button>
      </div>

      {/* Initial Parameters */}
      <div className={sectionCls}>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Initial Parameters</h3>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            Comma-separated initial guess values
          </label>
          <input
            type="text"
            className={inputCls}
            value={initialParams}
            placeholder="1.0, 1.0"
            onChange={(e) => setInitialParams(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Should match the number of equations ({equations.length})
          </p>
        </div>
      </div>

      {/* Solver Options */}
      <div className={sectionCls}>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Solver Options</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Method</label>
            <select
              className={inputCls}
              value={solverMethod}
              onChange={(e) => setSolverMethod(e.target.value as SolverMethod)}
            >
              <option value="hybr">hybr (Hybrid Powell)</option>
              <option value="lm">lm (Levenberg-Marquardt)</option>
              <option value="broyden1">broyden1 (Broyden)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Unit System</label>
            <select
              className={inputCls}
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Iterations</label>
            <input
              type="number"
              className={inputCls}
              min={1}
              max={100000}
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value, 10))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tolerance</label>
            <input
              type="text"
              className={inputCls}
              value={tolerance}
              placeholder="1e-8"
              onChange={(e) => setTolerance(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Well Config */}
      <div className={sectionCls}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useWellConfig}
            onChange={(e) => setUseWellConfig(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Well Configuration (optional)
          </span>
        </label>
        {useWellConfig && (
          <div className="mt-3">
            <WellConfigSection value={wellConfig} onChange={setWellConfig} />
          </div>
        )}
      </div>

      {validationError && (
        <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded px-3 py-2">
          {validationError}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed
                   text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
      >
        {disabled ? 'Calculating…' : 'Run Calculation'}
      </button>
    </form>
  )
}
