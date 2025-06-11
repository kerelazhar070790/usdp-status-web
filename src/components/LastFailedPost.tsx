'use client'

import useSWR from 'swr'
import { AlertTriangle } from 'lucide-react'

interface FailedPostData {
  attempt_time: string | null
  post_duration_seconds: number | null
  payload_size_bytes: number | null
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return 'N/A'
  const kb = bytes / 1024
  return `${kb.toFixed(1)} KB`
}

function formatToMYT(utcString: string | null | undefined): string {
  if (!utcString) return 'N/A'

  const utcDate = new Date(utcString)
  return new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(utcDate) + ' MYT'
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'

  const localDate = new Date(dateStr)
  if (isNaN(localDate.getTime())) return 'Invalid time'

  const diffMs = Date.now() - localDate.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  return `${diffHr}h ago`
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function LastFailedPost() {
  const { data, error } = useSWR<FailedPostData>(
    '/api/dashboard/last-failed-post',
    fetcher,
    { refreshInterval: 60000 }
  )

  if (error || !data || !data.attempt_time) {
    return (
      <div className="bg-white shadow-md rounded-xl p-6 mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={28} />
            <p className="text-lg font-semibold">Last Failed POST</p>
          </div>
          <p className="text-sm text-gray-500">No data</p>
        </div>
      </div>
    )
  }

  const { attempt_time, post_duration_seconds, payload_size_bytes } = data

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={28} />
          <p className="text-lg font-semibold">Last Failed POST</p>
        </div>
        <p className="text-sm text-gray-500">{timeAgo(attempt_time)}</p>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <p>Duration: <span className="font-medium">{post_duration_seconds?.toFixed(3) ?? 'N/A'}s</span></p>
        <p>Payload: <span className="font-medium">{formatBytes(payload_size_bytes)}</span></p>
        <p><span className="font-medium">{formatToMYT(attempt_time)}</span></p>
      </div>
    </div>
  )
}
