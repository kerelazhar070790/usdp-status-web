'use client'

import MainLayout from "@/components/layouts/MainLayout"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import LiveUptimeChart from "@/components/LiveUptimeChart"
import LatencyCard from "@/components/LatencyCard"
import LastSuccessfulPost from "@/components/LastSuccessfulPost"
import LastFailedPost from "@/components/LastFailedPost"
import { useState } from "react"

export default function DashboardPage() {
  const [selectedRange, setSelectedRange] = useState("24h")
  const ranges = ["24h", "7d", "30d", "90d"]

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto text-center mt-10 space-y-6">
        {/* System Status */}
        <div className="flex flex-col items-center space-y-2">
          <CheckCircle className="text-green-500" size={48} />
          <h1 className="text-2xl font-bold text-gray-800">All Systems Operational</h1>
          <a href="/incidents" className="text-sm text-gray-500 hover:underline">
            Incident History →
          </a>
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

        {/* Live Uptime Chart */}
        <LiveUptimeChart hours={
            selectedRange.endsWith("h") 
                ? parseInt(selectedRange.replace("h", ""))
                : parseInt(selectedRange.replace("d", "")) * 24
            } />

        <LatencyCard hours={parseInt(selectedRange.replace("h", ""))} />
        {/* Last Successful POST Card */}
        <LastSuccessfulPost />
        {/* Last Failed POST Card */}
        <LastFailedPost />
      </div>
    </MainLayout>
  )
}
