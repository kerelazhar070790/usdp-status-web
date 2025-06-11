'use client'

import useSWR from 'swr'
import { FileBarChart } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function formatMYTWithDate(utcString: string) {
  return new Date(utcString).toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function PostDurationChart({ hours = 24 }: { hours?: number }) {
  const range = hours === 168 ? "7d" :
                hours === 720 ? "30d" :
                hours === 2160 ? "90d" : "24h"

const { data, error, isLoading } = useSWR(
  `/api/dashboard/post-duration-trend?range=${range}`,
  fetcher,
  { refreshInterval: 60_000 }
)

  if (error) return <p className="text-red-600">Error loading POST duration.</p>
  if (isLoading || !data?.data) return <p className="text-gray-500">Loading POST duration…</p>

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <FileBarChart className="text-blue-500" size={28} />
        <p className="text-lg font-semibold">POST Duration & Payload Size Trend</p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-full">
          {data.data.map((entry: any, index: number) => (
            <div key={index} className="text-center">
              <div className="relative h-28 w-4 bg-gray-200 rounded">
                <div
                  className="absolute bottom-0 left-0 w-full bg-green-500 rounded-t"
                  style={{ height: `${entry.postDuration * 5}px` }}
                  title={`POST Duration: ${entry.postDuration}s`}
                ></div>
                <div
                  className="absolute bottom-0 left-1 w-1 bg-blue-400 rounded-t"
                  style={{ height: `${entry.payloadSize / 2000}px` }}
                  title={`Payload: ${entry.payloadSize} bytes`}
                ></div>
              </div>
              <div className="text-[10px] mt-1 text-gray-600 leading-tight whitespace-nowrap">
                {formatMYTWithDate(entry.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
