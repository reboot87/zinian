import { smoothPath } from '../lib/svg'

interface Props {
  values: number[]
  color: string
  width?: number
  height?: number
}

export function Spark({ values, color, width = 92, height = 26 }: Props) {
  if (values.length < 2) return <svg width={width} height={height} />

  const max = Math.max(...values, 12)
  const pts = values.map(
    (v, i) =>
      [
        (i / (values.length - 1)) * (width - 4) + 2,
        height - 3 - (v / max) * (height - 8),
      ] as [number, number],
  )
  const d = smoothPath(pts)
  const last = pts[pts.length - 1]

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.4} strokeOpacity={0.85} />
      <circle cx={last[0]} cy={last[1]} r={2.2} fill={color} />
    </svg>
  )
}
