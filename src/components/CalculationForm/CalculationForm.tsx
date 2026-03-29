import { useState } from 'react'
import type { CalculationRequest, WellParameters, UnitSystem } from '../../types/calculation'

interface Props {
  onSubmit: (req: CalculationRequest) => void
  disabled: boolean
}

const inputCls =
  'w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 ' +
  'focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors'

const sectionCls = 'bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3'

const DEFAULT_WELL: WellParameters = {
  tubingLengthM: 4000,
  tubingOdMm: 89,
  tubingWallMm: 6.5,
  casingOdMm: 168,
  casingWallMm: 10,
  fluidDensityKgM3: 1020,
  gravityMpS2: 9.81,
  initialWaterLevelM: 0,
  surfacePressurePa: 100000,
  maxWellheadPressurePa: 20000000,
  minWellheadPressurePa: 10000000,
}

function NumField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string
  value: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">
        {label}
        {unit && <span className="text-gray-500 ml-1">[{unit}]</span>}
      </label>
      <input
        type="number"
        step="any"
        className={inputCls}
        value={value}
        onChange={(e) => {
          const n = parseFloat(e.target.value)
          if (!isNaN(n)) onChange(n)
        }}
      />
    </div>
  )
}

export default function CalculationForm({ onSubmit, disabled }: Props) {
  const [well, setWell] = useState<WellParameters>(DEFAULT_WELL)
  const setWellField = <K extends keyof WellParameters>(key: K, val: WellParameters[K]) =>
    setWell((w) => ({ ...w, [key]: val }))

  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (well.tubingLengthM <= 0) {
      setValidationError('Tubing length must be positive.')
      return
    }
    if (well.casingOdMm <= well.tubingOdMm) {
      setValidationError('Casing OD must be greater than tubing OD.')
      return
    }

    const req: CalculationRequest = {
      options: { unitSystem },
      wellParams: well,
    }
    onSubmit(req)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-100">Well Completion Simulation</h2>

      <div className={sectionCls}>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tubing (НКТ)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Length" unit="m" value={well.tubingLengthM}
            onChange={(v) => setWellField('tubingLengthM', v)} />
          <NumField label="Outer diameter" unit="mm" value={well.tubingOdMm}
            onChange={(v) => setWellField('tubingOdMm', v)} />
          <NumField label="Wall thickness" unit="mm" value={well.tubingWallMm}
            onChange={(v) => setWellField('tubingWallMm', v)} />
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Casing (ОК)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Outer diameter" unit="mm" value={well.casingOdMm}
            onChange={(v) => setWellField('casingOdMm', v)} />
          <NumField label="Wall thickness" unit="mm" value={well.casingWallMm}
            onChange={(v) => setWellField('casingWallMm', v)} />
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Fluid &amp; Conditions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Fluid density" unit="kg/m³" value={well.fluidDensityKgM3}
            onChange={(v) => setWellField('fluidDensityKgM3', v)} />
          <NumField label="Gravity" unit="m/s²" value={well.gravityMpS2}
            onChange={(v) => setWellField('gravityMpS2', v)} />
          <NumField label="Surface pressure" unit="Pa" value={well.surfacePressurePa}
            onChange={(v) => setWellField('surfacePressurePa', v)} />
          <NumField label="Max wellhead pressure" unit="Pa" value={well.maxWellheadPressurePa}
            onChange={(v) => setWellField('maxWellheadPressurePa', v)} />
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit System</h3>
        <select className={inputCls} value={unitSystem}
          onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}>
          <option value="metric">Metric</option>
          <option value="imperial">Imperial</option>
        </select>
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
        {disabled ? 'Calculating…' : 'Run Well Simulation'}
      </button>
    </form>
  )
}
