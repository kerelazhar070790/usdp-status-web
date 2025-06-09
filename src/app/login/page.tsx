'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardContent className="space-y-6 p-6">
          <div className="text-center">
            <img
              src="/logo-meridian-xsmall.png"
              alt="Meridian Logo"
              className="mx-auto mb-4 w-20"
            />
            <h1 className="text-xl font-semibold">MSSB POST STATUS</h1>
            <p className="text-sm text-gray-500">Please login to continue</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Username</label>
              <Input type="text" placeholder="Enter username" />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button className="w-full">Login</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
