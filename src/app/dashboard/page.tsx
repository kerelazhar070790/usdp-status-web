'use client'

import MainLayout from "@/components/layouts/MainLayout"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import LiveUptimeChart from "@/components/LiveUptimeChart"
import LatencyCard from "@/components/LatencyCard"
import LastSuccessfulPost from "@/components/LastSuccessfulPost"
import LastFailedPost from "@/components/LastFailedPost"
import ActiveVesselCount from '@/components/ActiveVesselCount'
import OnHireVessels from '@/components/OnHireVessels'
import OffHireVessels from '@/components/OffHireVessels'
import PostDurationChart from '@/components/PostDurationChart'
import { useState } from "react"

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] = useState("24h")
  const ranges = ["24h", "7d", "30d", "90d"]

  const getHoursFromRange = (label: string): number => {
    if (label.endsWith("h")) {
      return parseInt(label.replace("h", ""))
    } else if (label.endsWith("d")) {
      return parseInt(label.replace("d", "")) * 24
    }
    return 24 // fallback
  }

  const hours = getHoursFromRange(selectedRange)

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto text-center mt-10 space-y-6">
        {/* System Status */}
        <div className="flex flex-col items-center space-y-2">
          <CheckCircle className="text-green-500" size={48} />
          <h1 className="text-2xl font-bold text-gray-800">All Systems Operational</h1>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center gap-2">
          {ranges.map((label) => (
            <Button
              key={label}
              onClick={() => setSelectedRange(label)}
              variant={label === selectedRange ? "default" : "outline"}
              className="text-sm w-16"
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Dynamic Cards */}
        <LiveUptimeChart hours={hours} />
        <LatencyCard hours={hours} />
        <PostDurationChart hours={hours} />

        <LastSuccessfulPost />
        <LastFailedPost />
        <ActiveVesselCount />
        <OnHireVessels />
        <OffHireVessels />
      </div>
    </MainLayout>
  )
}
