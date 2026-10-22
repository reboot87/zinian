import { useId } from 'react'
import { smoothPath, withAlpha } from '../lib/svg'

interface Props {
  values: number[]
  color: string
  days: number
}

export function HeatChart({ values, color, days }: Props) {
  const gid = useId().replace(/:/g, '')
  const w = 620
  const h = 140
  const padX = 4

  // 纵轴按峰值自适应，避免曲线贴着底边看不清
  const peak = Math.max(...values, 1)
  const top = Math.min(100, Math.max(45, Math.ceil((peak * 1.18) / 10) * 10))

  const pts = values.map(
    (v, i) =>
      [
        (i / Math.max(1, values.length - 1)) * (w - padX * 2) + padX,
        h - 6 - (Math.min(v, top) / top) * (h - 14),
      ] as [number, number],
  )
  const line = smoothPath(pts)
  const last = pts[pts.length - 1] ?? [0, h]
  const area = `${line} L ${last[0]} ${h} L ${pts[0]?.[0] ?? 0} ${h} Z`

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h + 22}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: 168, display: 'block' }}
      >
        <defs>
          <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={withAlpha(color, 0.26)} />
            <stop offset="100%" stopColor={withAlpha(color, 0)} />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={0}
            x2={w}
            y1={h - p * (h - 14) - 6}
            y2={h - p * (h - 14) - 6}
            stroke="rgba(237,230,218,0.06)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <line
          x1={0}
          x2={w}
          y1={h}
          y2={h}
          stroke="rgba(237,230,218,0.12)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        <path d={area} fill={`url(#g${gid})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={last[0]} cy={last[1]} r={3.4} fill={color} />
        <circle cx={last[0]} cy={last[1]} r={8} fill={withAlpha(color, 0.18)} />
      </svg>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          letterSpacing: '0.12em',
          color: 'var(--text-3)',
          marginTop: 2,
        }}
      >
        <span>{days} 天前</span>
        <span>{Math.round(days / 2)} 天前</span>
        <span>今天</span>
      </div>
    </div>
  )
}
