import './WellVisualization.css'
import { getFluidColor, getFluidColorLight, FLUID_COLORS, FLUID_LABELS } from './fluidColors'
import type { CalcStatus, FluidType, VolumeRequirement } from '../../types/calculation'

interface Props {
  percentage: number
  currentFluidType: FluidType | null
  phase: string | null
  volumes: VolumeRequirement[] | null
  status: CalcStatus
}

// SVG coordinate constants
const TUBE_TOP_Y    = 28
const TUBE_HEIGHT   = 344
const TUBE_BOTTOM_Y = TUBE_TOP_Y + TUBE_HEIGHT  // 372
const INNER_X       = 28
const INNER_W       = 64

function computeStackedBands(volumes: VolumeRequirement[]) {
  const total = volumes.reduce((s, v) => s + v.volumeM3, 0)
  if (total === 0) return []
  let offsetFraction = 0
  return volumes.map((vol) => {
    const frac = vol.volumeM3 / total
    const y = TUBE_TOP_Y + (1 - offsetFraction - frac) * TUBE_HEIGHT
    const height = frac * TUBE_HEIGHT
    offsetFraction += frac
    return { fluidType: vol.fluidType, y, height }
  })
}

export default function WellVisualization({ percentage, currentFluidType, phase, volumes, status }: Props) {
  const fluidColor      = getFluidColor(currentFluidType)
  const fluidColorLight = getFluidColorLight(currentFluidType)
  const fillScale       = Math.min(percentage, 100) / 100
  const bands           = volumes ? computeStackedBands(volumes) : []

  // Surface shimmer Y position (top of the fill)
  const fillHeight = fillScale * TUBE_HEIGHT
  const fillTopY   = TUBE_BOTTOM_Y - fillHeight

  const shimmerGradId = `shimmer-${currentFluidType ?? 'default'}`

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg
        viewBox="0 0 120 420"
        className="well-svg w-28 h-auto"
        data-status={status}
        aria-label="Well bore visualization"
      >
        <defs>
          {/* Metallic casing gradient */}
          <linearGradient id="casingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#546E7A" />
            <stop offset="20%"  stopColor="#B0BEC5" />
            <stop offset="50%"  stopColor="#ECEFF1" />
            <stop offset="80%"  stopColor="#B0BEC5" />
            <stop offset="100%" stopColor="#546E7A" />
          </linearGradient>

          {/* Active fluid shimmer */}
          <linearGradient id={shimmerGradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={fluidColor}      stopOpacity="1" />
            <stop offset="40%"  stopColor={fluidColorLight}  stopOpacity="0.9" />
            <stop offset="60%"  stopColor={fluidColorLight}  stopOpacity="0.9" />
            <stop offset="100%" stopColor={fluidColor}       stopOpacity="1" />
          </linearGradient>

          {/* Surface shimmer overlay */}
          <linearGradient id="surfaceShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="50%"  stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Clip to inner bore */}
          <clipPath id="wellClip">
            <rect x={INNER_X} y={TUBE_TOP_Y} width={INNER_W} height={TUBE_HEIGHT} />
          </clipPath>
        </defs>

        {/* ── EARTH FORMATION BACKGROUND ── */}
        <rect x="0" y="0" width="120" height="420" fill="#2C1810" />
        {/* Formation texture stripes */}
        <rect x="0"   y="80"  width="22" height="6"  fill="#3E2723" opacity="0.7" />
        <rect x="98"  y="80"  width="22" height="6"  fill="#3E2723" opacity="0.7" />
        <rect x="0"   y="170" width="22" height="5"  fill="#BF360C" opacity="0.25" />
        <rect x="98"  y="170" width="22" height="5"  fill="#BF360C" opacity="0.25" />
        <rect x="0"   y="260" width="22" height="8"  fill="#3E2723" opacity="0.5" />
        <rect x="98"  y="260" width="22" height="8"  fill="#3E2723" opacity="0.5" />
        <rect x="0"   y="340" width="22" height="6"  fill="#4E342E" opacity="0.4" />
        <rect x="98"  y="340" width="22" height="6"  fill="#4E342E" opacity="0.4" />

        {/* ── CASING WALLS ── */}
        <rect className="casing-left"  x="18" y="20" width="12" height="380" fill="url(#casingGrad)" />
        <rect className="casing-right" x="90" y="20" width="12" height="380" fill="url(#casingGrad)" />

        {/* ── WELLHEAD FITTINGS ── */}
        <rect x="14" y="12" width="92" height="12" fill="url(#casingGrad)" rx="2" />
        <rect x="20" y="6"  width="80" height="10" fill="#90A4AE"           rx="2" />
        <rect x="48" y="0"  width="24" height="10" fill="#78909C"           rx="2" />

        {/* ── BOTTOM CAP ── */}
        <rect x="18" y="396" width="84" height="12" fill="url(#casingGrad)" rx="4" />

        {/* ── INNER BORE (dark empty) ── */}
        <rect x={INNER_X} y={TUBE_TOP_Y} width={INNER_W} height={TUBE_HEIGHT} fill="#0f172a" />

        {/* ── FLUID CONTENT (clipped) ── */}
        <g clipPath="url(#wellClip)">

          {/* PROGRESS MODE: single rising fill (scaleY from bottom, GPU composited) */}
          {!volumes && (
            <rect
              className="fluid-fill-rect"
              x={INNER_X}
              y={TUBE_TOP_Y}
              width={INNER_W}
              height={TUBE_HEIGHT}
              fill={`url(#${shimmerGradId})`}
              style={{
                transform: `scaleY(${fillScale})`,
                transformBox: 'fill-box',
                transformOrigin: 'bottom',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          )}

          {/* RESULT MODE: stacked bands */}
          {volumes && bands.map((band, i) => (
            <rect
              key={band.fluidType}
              className="fluid-band"
              x={INNER_X}
              y={band.y}
              width={INNER_W}
              height={band.height}
              fill={getFluidColor(band.fluidType)}
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}

          {/* BUBBLES (only during streaming) */}
          {status === 'streaming' && !volumes && fillScale > 0.05 && (
            <g
              className="bubbles"
              style={{
                transform: `translateY(${fillTopY + fillHeight * 0.6}px)`,
              }}
            >
              <circle className="bubble bubble-1" cx="38" r="2.5" cy="0" fill="white" fillOpacity="0.25" />
              <circle className="bubble bubble-2" cx="52" r="1.8" cy="0" fill="white" fillOpacity="0.2" />
              <circle className="bubble bubble-3" cx="66" r="2.2" cy="0" fill="white" fillOpacity="0.22" />
              <circle className="bubble bubble-4" cx="45" r="1.5" cy="0" fill="white" fillOpacity="0.18" />
              <circle className="bubble bubble-5" cx="78" r="2.0" cy="0" fill="white" fillOpacity="0.2" />
            </g>
          )}

          {/* SURFACE SHIMMER (progress mode only) */}
          {!volumes && fillScale > 0 && (
            <rect
              className="surface-shimmer"
              x={INNER_X}
              y={fillTopY - 4}
              width={INNER_W}
              height={8}
              fill="url(#surfaceShimmer)"
            />
          )}

        </g>

        {/* ── DEPTH TICKS ── */}
        <g stroke="#546E7A" strokeWidth="0.8" opacity="0.6">
          {[25, 50, 75].map((pct) => {
            const tickY = TUBE_TOP_Y + (pct / 100) * TUBE_HEIGHT
            return (
              <g key={pct}>
                <line x1="18" y1={tickY} x2="24" y2={tickY} />
                <line x1="96" y1={tickY} x2="102" y2={tickY} />
              </g>
            )
          })}
        </g>

        {/* ── PERCENTAGE LABEL ── */}
        {status === 'streaming' && fillScale > 0 && (
          <text
            className="pct-label"
            x="60"
            y={Math.max(fillTopY - 6, 44)}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {percentage}%
          </text>
        )}

        {/* ── DONE LABEL ── */}
        {status === 'done' && (
          <text
            x="60"
            y="42"
            textAnchor="middle"
            fill="#4ade80"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            COMPLETE
          </text>
        )}
      </svg>

      {/* ── FLUID LEGEND ── */}
      <div className="w-full space-y-1.5 text-xs px-1">
        {volumes
          ? volumes.map((v) => (
              <div key={v.fluidType} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: FLUID_COLORS[v.fluidType] ?? '#37474F' }}
                />
                <span className="text-gray-300 truncate">{FLUID_LABELS[v.fluidType] ?? v.fluidType}</span>
                <span className="text-gray-500 ml-auto font-mono">{v.volumeM3.toFixed(1)}m³</span>
              </div>
            ))
          : currentFluidType && (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0 animate-pulse"
                  style={{ backgroundColor: FLUID_COLORS[currentFluidType] ?? '#37474F' }}
                />
                <span className="text-gray-300 truncate">{FLUID_LABELS[currentFluidType] ?? currentFluidType}</span>
              </div>
            )}
      </div>

      {/* ── PHASE INDICATOR ── */}
      {phase && status === 'streaming' && (
        <div className="w-full text-center">
          <span className="text-xs text-amber-400 font-mono">
            {phase.replace(/_/g, ' ')}
          </span>
        </div>
      )}
    </div>
  )
}
