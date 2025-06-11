'use client'

import useSWR from 'swr'
import { Ship } from 'lucide-react'

type Vessel = {
  vesselid: string
  name: string
  hireDateTimeMYT: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function OnHireVessels() {
  const { data, error } = useSWR<{ total: number; vessels: Vessel[] }>(
    '/api/dashboard/onhire-vessels',
    fetcher,
    { refreshInterval: 60000 }
  )

  const todayStr = new Date().toLocaleDateString('en-GB')

  if (error || !data) {
    return <p className="text-sm text-red-600 mt-6">Failed to load on-hire vessel data.</p>
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <Ship className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">On-Hire Vessels Today</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{todayStr}</p>
          <p className="text-4xl font-bold text-red-600 mt-1">{data.total}</p>
        </div>
      </div>

      {data.total > 0 ? (
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 border-b border-gray-200">
                <th className="pb-2">MMSI</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Hire Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {data.vessels.map((v, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2">{v.vesselid}</td>
                  <td className="py-2">{v.name}</td>
                  <td className="py-2">{v.hireDateTimeMYT}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No vessels were marked as on-hire during the current window.</p>
      )}
    </div>
  )
}
