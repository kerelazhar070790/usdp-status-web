'use client'

import { Ship } from 'lucide-react'
import useSWR from 'swr'

export default function ActiveVesselCount() {
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data, error, isLoading } = useSWR('/api/dashboard/active-vessel-count', fetcher, {
  refreshInterval: 60000
  })

  if (isLoading) {
    return <div className="bg-white shadow-md rounded-xl p-6 mt-6 text-gray-500">Loading active vessel count…</div>
  }

  if (error || !data || data.error) {
    return <div className="bg-white shadow-md rounded-xl p-6 mt-6 text-red-600">Error loading active vessel count.</div>
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ship className="text-blue-500" size={24} />
          <p className="text-lg font-semibold text-gray-800">Total Active Vessels</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">{new Date().toLocaleDateString('en-MY')}</div>
          <div className="text-4xl font-bold text-blue-600">{data.total}</div>
        </div>
      </div>
    </div>
  )
}
