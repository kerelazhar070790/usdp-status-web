'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    setError("")
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push("/dashboard")
      } else {
        const data = await res.json()
        setError(data.error || "Login failed")
      }
    } catch (err) {
      setError("Unexpected error occurred")
    }
  }

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
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}

            <Button className="w-full" onClick={handleLogin}>
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
