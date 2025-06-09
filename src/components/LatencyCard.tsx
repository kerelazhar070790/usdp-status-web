'use client'

import useSWR from "swr"
import { Activity } from "lucide-react"

type Hourly = {
  timestamp: string
  responseTimeMs: number | null
}

export default function LatencyCard({ hours = 24 }: { hours?: number }) {
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data, error, isLoading } = useSWR<Hourly[]>(
    `/api/uptime?range=${hours}h`,
    fetcher,
    { refreshInterval: 60_000 }
  )

  if (error || !data || data.length === 0) return null

  const formatToMYT = (utcStr: string) => {
    const dateUTC = new Date(utcStr)
    const dateMYT = new Date(dateUTC.getTime() + 8 * 60 * 60 * 1000)
    return new Intl.DateTimeFormat('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(dateMYT)
  }

  const latencyValues = data.map((d) => d.responseTimeMs ?? 0)
  const max = Math.max(...latencyValues, 1)
  const min = Math.min(...latencyValues)
  const minY = Math.max(min - 1, 0) // breathing room below the line
  const maxY = max + 1

  const normalize = (value: number) => {
    return 100 - ((value - minY) / (maxY - minY)) * 100
  }

  const avgMs =
    latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length

  const avgSec = (avgMs / 1000).toFixed(3)

  const points = data.map((h, i) => {
    const x = i * 12
    const y = normalize(h.responseTimeMs ?? 0)
    return `${x},${y}`
  })

  const polygonPoints = [
    `0,100`,
    ...points,
    `${(data.length - 1) * 12},100`,
  ].join(" ")

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-500" size={22} />
          <div>
            <p className="text-base font-semibold text-gray-800">Latency</p>
            <p className="text-xs text-gray-500">Measured over past {hours}h</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{avgSec}s</p>
          <p className="text-xs text-gray-500">Avg response time</p>
        </div>
      </div>

      {/* Flare-style graph */}
     <div className="relative h-14 w-full bg-gray-50 rounded-md overflow-x-auto overflow-y-hidden">
        <div className={`absolute left-0 h-full`} style={{ width: `${data.length * 12}px` }}>
            <svg viewBox={`0 0 ${data.length * 12} 100`} className="h-full w-full">
          {/* Fill area under line */}
          <polygon
            points={polygonPoints}
            fill="#93c5fd55"
          />
          {/* Main line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points.join(" ")}
          />
          {/* Tooltip points */}
          {data.map((h, i) => {
            const x = i * 12
            const y = normalize(h.responseTimeMs ?? 0)
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={2}
                fill="#1d4ed8"
              >
                <title>{formatToMYT(h.timestamp)} MYT{"\n"}{h.responseTimeMs ?? 0} ms</title>
              </circle>
            )
          })}
        </svg>
      </div>
      </div>
    </div>
  )
}
