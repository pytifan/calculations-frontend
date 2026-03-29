import './WellVisualization.css'
import { FLUID_COLORS, FLUID_LABELS } from './fluidColors'
import type { CalcStatus, FluidType, VolumeRequirement } from '../../types/calculation'

interface Props {
  percentage: number
  phase: string | null
  volumes: VolumeRequirement[] | null
  status: CalcStatus
  // Well-completion progress fields (present during streaming)
  annulusFrontM?: number
  tubingFrontM?: number
  tubingLengthM?: number
  wellheadPressurePa?: number
  bottomPressurePa?: number
  volumePumpedM3?: number
  // Legacy single-fluid props (generic solver)
  currentFluidType?: FluidType | null
}

// SVG layout constants
const WELL_TOP_Y    = 28
const WELL_HEIGHT   = 344
const WELL_BOTTOM_Y = WELL_TOP_Y + WELL_HEIGHT  // 372
const SVG_W         = 140

// Two columns inside the wellbore
// Tubing is the inner pipe, annulus is the space between tubing and casing
const CASING_LEFT   = 14
const CASING_RIGHT  = SVG_W - 14

// Annulus occupies most of the inner bore
const ANN_LEFT      = 30    // inner edge of casing on left
const ANN_RIGHT     = 76    // outer wall of tubing on right side of annulus

// Tubing inner bore
const TUB_LEFT      = 80    // left inner wall of tubing
const TUB_RIGHT     = 108   // right inner wall of tubing

const WALL_COLOR    = '#546E7A'
const OLD_FLUID_CLR = '#37474F'  // dark grey: original brine/water
const NEW_FLUID_CLR = '#1565C0'  // blue: completion fluid
const EMPTY_CLR     = '#0f172a'  // near black: evacuated zone

/**
 * Convert a depth fraction [0,1] to SVG Y coordinate (0=surface, 1=bottom).
 */
function depthToY(frac: number) {
  return WELL_TOP_Y + frac * WELL_HEIGHT
}

function WellCompletionView({
  annulusFrontFrac,
  tubingFrontFrac,
  status,
  percentage,
}: {
  annulusFrontFrac: number   // 0 = surface, 1 = bottom — new fluid in annulus down to here
  tubingFrontFrac: number    // 0 = top — old fluid starts here in tubing (above = evacuated)
  status: CalcStatus
  percentage: number
}) {
  const annFrontY = depthToY(annulusFrontFrac)
  const tubFrontY = depthToY(tubingFrontFrac)

  return (
    <svg viewBox={`0 0 ${SVG_W} 420`} className="well-svg w-36 h-auto" aria-label="Well bore">
      <defs>
        <linearGradient id="casingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#546E7A" />
          <stop offset="30%"  stopColor="#B0BEC5" />
          <stop offset="50%"  stopColor="#ECEFF1" />
          <stop offset="70%"  stopColor="#B0BEC5" />
          <stop offset="100%" stopColor="#546E7A" />
        </linearGradient>
        <linearGradient id="newFluidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={NEW_FLUID_CLR} />
          <stop offset="50%"  stopColor="#1976D2" />
          <stop offset="100%" stopColor={NEW_FLUID_CLR} />
        </linearGradient>
        <clipPath id="annClip">
          <rect x={ANN_LEFT} y={WELL_TOP_Y} width={ANN_RIGHT - ANN_LEFT} height={WELL_HEIGHT} />
        </clipPath>
        <clipPath id="tubClip">
          <rect x={TUB_LEFT} y={WELL_TOP_Y} width={TUB_RIGHT - TUB_LEFT} height={WELL_HEIGHT} />
        </clipPath>
      </defs>

      {/* Earth background */}
      <rect x="0" y="0" width={SVG_W} height="420" fill="#2C1810" />
      {[80, 170, 260, 340].map((y, i) => (
        <rect key={i} x="0" y={y} width={CASING_LEFT} height="6" fill="#3E2723" opacity="0.6" />
      ))}
      {[80, 170, 260, 340].map((y, i) => (
        <rect key={i} x={CASING_RIGHT} y={y} width={SVG_W - CASING_RIGHT} height="6" fill="#3E2723" opacity="0.6" />
      ))}

      {/* Casing walls */}
      <rect x={CASING_LEFT}      y="20" width={ANN_LEFT - CASING_LEFT} height="380" fill="url(#casingGrad)" />
      <rect x={CASING_RIGHT - (ANN_LEFT - CASING_LEFT)} y="20"
            width={ANN_LEFT - CASING_LEFT} height="380" fill="url(#casingGrad)" />

      {/* Tubing walls */}
      <rect x={ANN_RIGHT}  y="20" width={TUB_LEFT - ANN_RIGHT}  height="380" fill={WALL_COLOR} opacity="0.9" />
      <rect x={TUB_RIGHT}  y="20" width={SVG_W - TUB_RIGHT - (SVG_W - CASING_RIGHT)}
            height="380" fill={WALL_COLOR} opacity="0.9" />

      {/* Wellhead fittings */}
      <rect x={CASING_LEFT - 4} y="12" width={CASING_RIGHT - CASING_LEFT + 8} height="10"
            fill="url(#casingGrad)" rx="2" />
      <rect x="56" y="4" width="28" height="10" fill="#78909C" rx="2" />

      {/* Bottom cap */}
      <rect x={CASING_LEFT} y="396" width={CASING_RIGHT - CASING_LEFT} height="12"
            fill="url(#casingGrad)" rx="4" />

      {/* ── ANNULUS FLUID ── */}
      <g clipPath="url(#annClip)">
        {/* New fluid (top section, descends from surface) */}
        <rect x={ANN_LEFT} y={WELL_TOP_Y} width={ANN_RIGHT - ANN_LEFT}
              height={Math.max(0, annFrontY - WELL_TOP_Y)}
              fill="url(#newFluidGrad)" />
        {/* Old fluid (below new fluid front) */}
        <rect x={ANN_LEFT} y={annFrontY} width={ANN_RIGHT - ANN_LEFT}
              height={Math.max(0, WELL_BOTTOM_Y - annFrontY)}
              fill={OLD_FLUID_CLR} />
        {/* Annulus front shimmer line */}
        {annulusFrontFrac > 0 && annulusFrontFrac < 1 && (
          <rect x={ANN_LEFT} y={annFrontY - 1} width={ANN_RIGHT - ANN_LEFT} height="2"
                fill="white" fillOpacity="0.4" />
        )}
      </g>

      {/* ── TUBING FLUID ── */}
      <g clipPath="url(#tubClip)">
        {/* Evacuated zone (top, grows as old fluid exits) */}
        <rect x={TUB_LEFT} y={WELL_TOP_Y} width={TUB_RIGHT - TUB_LEFT}
              height={Math.max(0, tubFrontY - WELL_TOP_Y)}
              fill={EMPTY_CLR} />
        {/* Old fluid (below evacuated zone) */}
        <rect x={TUB_LEFT} y={tubFrontY} width={TUB_RIGHT - TUB_LEFT}
              height={Math.max(0, WELL_BOTTOM_Y - tubFrontY)}
              fill={OLD_FLUID_CLR} />
        {/* Tubing front shimmer */}
        {tubingFrontFrac > 0 && tubingFrontFrac < 1 && (
          <rect x={TUB_LEFT} y={tubFrontY - 1} width={TUB_RIGHT - TUB_LEFT} height="2"
                fill="white" fillOpacity="0.35" />
        )}
      </g>

      {/* Depth ticks */}
      <g stroke="#546E7A" strokeWidth="0.8" opacity="0.5">
        {[25, 50, 75].map((pct) => {
          const y = depthToY(pct / 100)
          return (
            <g key={pct}>
              <line x1={CASING_LEFT} y1={y} x2={ANN_LEFT} y2={y} />
              <line x1={CASING_RIGHT - (ANN_LEFT - CASING_LEFT)} y1={y} x2={CASING_RIGHT} y2={y} />
            </g>
          )
        })}
      </g>

      {/* Column labels */}
      <text x={(ANN_LEFT + ANN_RIGHT) / 2} y={WELL_TOP_Y - 4}
            textAnchor="middle" fill="#78909C" fontSize="7" fontFamily="monospace">ANN</text>
      <text x={(TUB_LEFT + TUB_RIGHT) / 2} y={WELL_TOP_Y - 4}
            textAnchor="middle" fill="#78909C" fontSize="7" fontFamily="monospace">TUB</text>

      {/* Percentage label */}
      {status === 'streaming' && percentage > 0 && (
        <text x={SVG_W / 2} y="16" textAnchor="middle"
              fill="white" fontSize="9" fontFamily="monospace" fontWeight="bold">
          {percentage}%
        </text>
      )}
      {status === 'done' && (
        <text x={SVG_W / 2} y="16" textAnchor="middle"
              fill="#4ade80" fontSize="9" fontFamily="monospace" fontWeight="bold">
          DONE
        </text>
      )}
    </svg>
  )
}

function SingleBoreView({
  percentage,
  currentFluidType,
  volumes,
  status,
}: {
  percentage: number
  currentFluidType: FluidType | null | undefined
  volumes: VolumeRequirement[] | null
  status: CalcStatus
}) {
  const fluidColor = FLUID_COLORS[currentFluidType ?? ''] ?? '#37474F'
  const fillScale  = Math.min(percentage, 100) / 100
  const INNER_X    = 28
  const INNER_W    = 64
  const fillHeight = fillScale * WELL_HEIGHT
  const fillTopY   = WELL_BOTTOM_Y - fillHeight

  return (
    <svg viewBox="0 0 120 420" className="well-svg w-28 h-auto" aria-label="Well bore">
      <defs>
        <linearGradient id="casingGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#546E7A" />
          <stop offset="50%"  stopColor="#ECEFF1" />
          <stop offset="100%" stopColor="#546E7A" />
        </linearGradient>
        <clipPath id="wellClip2">
          <rect x={INNER_X} y={WELL_TOP_Y} width={INNER_W} height={WELL_HEIGHT} />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="120" height="420" fill="#2C1810" />
      <rect x="18" y="20" width="12" height="380" fill="url(#casingGrad2)" />
      <rect x="90" y="20" width="12" height="380" fill="url(#casingGrad2)" />
      <rect x="14" y="12" width="92" height="12" fill="url(#casingGrad2)" rx="2" />
      <rect x="48" y="0"  width="24" height="10" fill="#78909C" rx="2" />
      <rect x="18" y="396" width="84" height="12" fill="url(#casingGrad2)" rx="4" />
      <rect x={INNER_X} y={WELL_TOP_Y} width={INNER_W} height={WELL_HEIGHT} fill="#0f172a" />
      <g clipPath="url(#wellClip2)">
        {!volumes && (
          <rect x={INNER_X} y={WELL_TOP_Y} width={INNER_W} height={WELL_HEIGHT}
                fill={fluidColor}
                style={{
                  transform: `scaleY(${fillScale})`,
                  transformBox: 'fill-box',
                  transformOrigin: 'bottom',
                  transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
        )}
        {volumes && volumes.map((v, i) => {
          const total = volumes.reduce((s, x) => s + x.volumeM3, 0)
          const frac = v.volumeM3 / (total || 1)
          const offset = volumes.slice(0, i).reduce((s, x) => s + x.volumeM3 / (total || 1), 0)
          const y = WELL_TOP_Y + (1 - offset - frac) * WELL_HEIGHT
          return (
            <rect key={v.fluidType} x={INNER_X} y={y} width={INNER_W}
                  height={frac * WELL_HEIGHT}
                  fill={FLUID_COLORS[v.fluidType] ?? '#37474F'} />
          )
        })}
      </g>
      {status === 'streaming' && percentage > 0 && (
        <text x="60" y={Math.max(fillTopY - 4, 42)} textAnchor="middle"
              fill="white" fontSize="10" fontFamily="monospace" fontWeight="bold">
          {percentage}%
        </text>
      )}
      {status === 'done' && (
        <text x="60" y="42" textAnchor="middle"
              fill="#4ade80" fontSize="9" fontFamily="monospace" fontWeight="bold">
          COMPLETE
        </text>
      )}
    </svg>
  )
}

export default function WellVisualization({
  percentage,
  phase,
  volumes,
  status,
  annulusFrontM,
  tubingFrontM,
  tubingLengthM,
  wellheadPressurePa,
  bottomPressurePa,
  volumePumpedM3,
  currentFluidType,
}: Props) {
  const isWellMode = annulusFrontM !== undefined && tubingLengthM !== undefined && tubingLengthM > 0
  const L = tubingLengthM ?? 1

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {isWellMode ? (
        <WellCompletionView
          annulusFrontFrac={Math.min((annulusFrontM ?? 0) / L, 1)}
          tubingFrontFrac={Math.min((tubingFrontM ?? 0) / L, 1)}
          status={status}
          percentage={percentage}
        />
      ) : (
        <SingleBoreView
          percentage={percentage}
          currentFluidType={currentFluidType}
          volumes={volumes}
          status={status}
        />
      )}

      {/* Pressure readout (well completion mode only) */}
      {isWellMode && (wellheadPressurePa !== undefined || bottomPressurePa !== undefined) && (
        <div className="w-full grid grid-cols-2 gap-1 text-xs font-mono">
          {wellheadPressurePa !== undefined && (
            <div className="bg-gray-900 border border-gray-700 rounded px-2 py-1">
              <span className="text-gray-500">Pu</span>{' '}
              <span className="text-amber-400">{(wellheadPressurePa / 1e5).toFixed(1)} bar</span>
            </div>
          )}
          {bottomPressurePa !== undefined && (
            <div className="bg-gray-900 border border-gray-700 rounded px-2 py-1">
              <span className="text-gray-500">Pb</span>{' '}
              <span className="text-cyan-400">{(bottomPressurePa / 1e5).toFixed(1)} bar</span>
            </div>
          )}
          {volumePumpedM3 !== undefined && (
            <div className="bg-gray-900 border border-gray-700 rounded px-2 py-1 col-span-2">
              <span className="text-gray-500">Q</span>{' '}
              <span className="text-green-400">{volumePumpedM3.toFixed(1)} m³</span>
            </div>
          )}
        </div>
      )}

      {/* Fluid legend (well completion result) */}
      {isWellMode && volumes && (
        <div className="w-full space-y-1 text-xs px-1">
          {volumes.map((v) => (
            <div key={v.fluidType} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0"
                   style={{ backgroundColor: FLUID_COLORS[v.fluidType] ?? '#37474F' }} />
              <span className="text-gray-300 truncate">
                {FLUID_LABELS[v.fluidType] ?? v.fluidType.replace(/_/g, ' ')}
              </span>
              <span className="text-gray-500 ml-auto">{v.volumeM3.toFixed(1)} m³</span>
            </div>
          ))}
        </div>
      )}

      {/* Generic fluid legend */}
      {!isWellMode && volumes && (
        <div className="w-full space-y-1.5 text-xs px-1">
          {volumes.map((v) => (
            <div key={v.fluidType} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0"
                   style={{ backgroundColor: FLUID_COLORS[v.fluidType] ?? '#37474F' }} />
              <span className="text-gray-300 truncate">{FLUID_LABELS[v.fluidType] ?? v.fluidType}</span>
              <span className="text-gray-500 ml-auto font-mono">{v.volumeM3.toFixed(1)} m³</span>
            </div>
          ))}
        </div>
      )}

      {/* Legend: annulus / tubing colors */}
      {isWellMode && status === 'streaming' && (
        <div className="w-full space-y-1 text-xs px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: NEW_FLUID_CLR }} />
            <span className="text-gray-300">Completion fluid (new)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: OLD_FLUID_CLR }} />
            <span className="text-gray-300">Formation brine (old)</span>
          </div>
        </div>
      )}

      {/* Phase indicator */}
      {phase && status === 'streaming' && (
        <div className="w-full text-center">
          <span className="text-xs text-amber-400 font-mono">{phase.replace(/_/g, ' ')}</span>
        </div>
      )}
    </div>
  )
}
