'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import MainLayout from '@/components/layouts/MainLayout'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

function convertToMYT(dateStr: string) {
  const utc = new Date(dateStr)
  const myt = new Date(utc.getTime() + 8 * 60 * 60 * 1000)
  return myt.toLocaleString('en-MY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const toMYT = (utcString: string) => {
  return dayjs.utc(utcString).tz('Asia/Kuala_Lumpur').format('DD/MM/YYYY, hh:mm:ss A')
}


// Convert MYT date to UTC string
const toUTCDateString = (d: Date, endOfDay = false) => {
  const dateMYT = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }))
  if (endOfDay) {
    dateMYT.setHours(23, 59, 59, 999)
  } else {
    dateMYT.setHours(0, 0, 0, 0)
  }
  return dateMYT.toISOString().split('T')[0]
}

let searchTimeout: NodeJS.Timeout

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [page, setPage] = useState(1)
  const [jumpToPage, setJumpToPage] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')

  const fetchLogs = async () => {
    setError('')
    try {
      const startStr = toUTCDateString(startDate)
      const endStr = toUTCDateString(endDate, true)
      const params = new URLSearchParams({
        startDate: startStr,
        endDate: endStr,
        page: page.toString(),
        limit: '10',
        search: debouncedSearch,
      })

      const res = await fetch(`/api/logs?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to fetch logs.')
        setLogs([])
      } else {
        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (err) {
      setError('Network or server error.')
      setLogs([])
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [startDate, endDate, page, debouncedSearch])

  useEffect(() => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
  }, [search])

  const handlePageJump = () => {
    const num = parseInt(jumpToPage)
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      setPage(num)
      setJumpToPage('')
    }
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
        <h1 className="text-xl font-bold text-gray-800">Successful POST Logs</h1>

        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date!)}
              className="border rounded px-2 py-1"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div>
            <label className="block text-sm">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date!)}
              className="border rounded px-2 py-1"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm">Search Vessel</label>
            <Input
              placeholder="Enter name or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="overflow-auto border rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="px-4 py-2">Vessel ID</th>
                <th className="px-4 py-2">Vessel Name</th>
                <th className="px-4 py-2">Trail CTimestamp (MYT)</th>
                <th className="px-4 py-2">POST Time (MYT)</th>
                <th className="px-4 py-2">Payload ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No logs found for the selected date or search term.
                  </td>
                </tr>
              ) : (
                logs.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{row.vessel_id}</td>
                    <td className="px-4 py-2">{row.vessel_name}</td>
                    <td className="px-4 py-2">{toMYT(row.rdatetime)}</td>
                    <td className="px-4 py-2">{toMYT(row.attempt_time)}</td>
                    <td className="px-4 py-2">{row.payload_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
            >
              Next
            </Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              placeholder="Go to page"
              className="w-32"
            />
            <Button onClick={handlePageJump} variant="outline">Go</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
