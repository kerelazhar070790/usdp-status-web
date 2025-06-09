'use client'

import useSWR from 'swr'
import { Clock3 } from 'lucide-react'

// Convert UTC to MYT (UTC+8)
function convertToMYT(utcStr: string) {
  const utcDate = new Date(utcStr)
  const mytDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000)
  return mytDate
}

// Format "x ago"
function timeAgoFromMYT(mytDate: Date) {
  const now = new Date()
  const diff = Math.floor((now.getTime() - mytDate.getTime()) / 1000)

  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Format timestamp into readable string (MYT)
function formatMYT(mytDate: Date) {
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(mytDate)
}

// Format bytes
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export default function LastSuccessfulPost() {
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data, error, isLoading } = useSWR('/api/dashboard/last-successful-post', fetcher)

  if (isLoading) {
    return <div className="bg-white shadow-md rounded-xl p-6 mt-6 text-gray-500">Loading last successful post…</div>
  }

  if (error || !data || data.error) {
    return <div className="bg-white shadow-md rounded-xl p-6 mt-6 text-red-600">Error loading last successful post.</div>
  }

  const { received_at, post_duration_seconds, payload_size_bytes } = data
  const mytDate = convertToMYT(received_at)

    return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6">
        <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <Clock3 className="text-blue-500" size={24} />
            <p className="text-lg font-semibold text-gray-800">Last Successful POST</p>
        </div>
        <span className="text-sm text-gray-500">{timeAgoFromMYT(mytDate)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
            Duration: <span className="font-medium">
            {post_duration_seconds != null ? `${post_duration_seconds.toFixed(3)}s` : 'N/A'}
            </span>
        </p>
        <p>
            Payload: <span className="font-medium">
            {payload_size_bytes != null ? formatBytes(payload_size_bytes) : 'N/A'}
            </span>
        </p>
        <p className="text-right">
            <span className="font-medium">{formatMYT(mytDate)} MYT</span>
        </p>
        </div>
    </div>
    )
}
