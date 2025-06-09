'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface FailedPostData {
  attempt_time: string
  post_duration_seconds: number | null
  payload_size_bytes: number | null
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return 'N/A'
  const kb = bytes / 1024
  return `${kb.toFixed(1)} KB`
}

function formatToMYT(utcString: string): string {
  const localDate = new Date(utcString)  // already in local time (MYT)
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(localDate) + ' MYT'
}

function timeAgo(dateStr: string): string {
  const localDate = new Date(dateStr) // already in local time (MYT)
  const diffMs = Date.now() - localDate.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  return `${diffHr}h ago`
}

export default function LastFailedPost() {
  const [data, setData] = useState<FailedPostData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/last-failed-post')
      .then(res => res.json())
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error || !data) {
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
