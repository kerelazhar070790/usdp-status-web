'use client'

import useSWR from "swr"
import { Activity } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type Hourly = {
  timestamp: string
  responseTimeMs: number | null
  status: 'up' | 'down'
  retries: number
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
  return new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dateUTC)
}

  const avgMs = data.reduce((a, b) => a + (b.responseTimeMs ?? 0), 0) / data.length
  const avgSec = (avgMs / 1000).toFixed(3)

  const chartData = data.map(d => ({
    ...d,
    time: formatToMYT(d.timestamp),
    latency: d.responseTimeMs ?? 0,
  }))

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

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              minTickGap={15}
            />
            <YAxis
              dataKey="latency"
              unit="ms"
              tick={{ fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ fontSize: '12px' }}
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value: any) => [`${value} ms`, 'Latency']}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
