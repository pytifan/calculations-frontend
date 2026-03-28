import type { WellConfig, FluidType } from '../../types/calculation'

const FLUID_OPTIONS: { value: FluidType; label: string }[] = [
  { value: 'drilling_mud',       label: 'Drilling Mud' },
  { value: 'cement',             label: 'Cement' },
  { value: 'completion_fluid',   label: 'Completion Fluid' },
  { value: 'spacer_fluid',       label: 'Spacer Fluid' },
  { value: 'displacement_fluid', label: 'Displacement Fluid' },
]

interface Props {
  value: Partial<WellConfig>
  onChange: (v: Partial<WellConfig>) => void
}

const inputCls =
  'w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 ' +
  'focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors'

export default function WellConfigSection({ value, onChange }: Props) {
  const set = <K extends keyof WellConfig>(key: K, val: WellConfig[K]) =>
    onChange({ ...value, [key]: val })

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Well Name *</label>
        <input
          type="text"
          className={inputCls}
          placeholder="Well-A1"
          value={value.wellName ?? ''}
          onChange={(e) => set('wellName', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Field Name *</label>
        <input
          type="text"
          className={inputCls}
          placeholder="North Sea Field"
          value={value.fieldName ?? ''}
          onChange={(e) => set('fieldName', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Depth (m) *</label>
        <input
          type="number"
          className={inputCls}
          placeholder="3500"
          min="0"
          step="0.1"
          value={value.depthMeters ?? ''}
          onChange={(e) => set('depthMeters', parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Diameter (in) *</label>
        <input
          type="number"
          className={inputCls}
          placeholder="8.5"
          min="0"
          step="0.1"
          value={value.diameterInches ?? ''}
          onChange={(e) => set('diameterInches', parseFloat(e.target.value))}
        />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-gray-400 mb-1">Fluid Type *</label>
        <select
          className={inputCls}
          value={value.fluidType ?? ''}
          onChange={(e) => set('fluidType', e.target.value as FluidType)}
        >
          <option value="">Select fluid…</option>
          {FLUID_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
