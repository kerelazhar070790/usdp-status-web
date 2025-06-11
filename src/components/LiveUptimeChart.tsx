'use client'

import useSWR from "swr"
import { CheckCircle, Clock6 } from "lucide-react"

type Hourly = {
  timestamp: string
  status: 'up' | 'down'
  responseTimeMs: number | null
  retries: number
}

export default function LiveUptimeChart({ hours = 24 }: { hours?: number }) {
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data, error, isLoading } = useSWR<Hourly[]>(
    `/api/uptime?range=${hours}h`,
    fetcher,
    { refreshInterval: 60_000 }
  )

  if (error) return <p className="text-red-600">Error loading uptime.</p>
  if (isLoading || !data) return <p className="text-gray-500">Loading uptime…</p>

  const total = data.length
  const upCount = data.filter(h => h.status === "up").length
  const uptimePct = ((upCount / total) * 100).toFixed(2)

  const formatToMYT = (utcStr: string) => {
  const dateUTC = new Date(utcStr)
  return new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dateUTC)
}

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {upCount === total ? (
            <CheckCircle className="text-green-500" size={28} />
          ) : (
            <Clock6 className="text-yellow-500" size={28} />
          )}
          <p className="text-lg font-semibold">Uptime ({hours}h)</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{uptimePct}%</p>
          <p className="text-xs text-gray-500">Success rate</p>
        </div>
      </div>

      {/* Uptime Bars */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-full">
          {data.map((h, i) => (
            <div
              key={i}
              title={`[${formatToMYT(h.timestamp)} MYT]\nStatus: ${h.status.toUpperCase()}\nLatency: ${h.responseTimeMs ?? 'N/A'} ms\nRetries: ${h.retries}`}
              className={`h-6 w-2 rounded cursor-pointer ${
                h.status === 'up' ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
          ))}
        </div>
      </div>

    </div>
  )
}
