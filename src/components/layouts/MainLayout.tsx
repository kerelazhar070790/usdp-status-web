'use client'

import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

interface MainLayoutProps {
  children: ReactNode
}

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Logs", href: "/ops/logs" },
  { name: "Errors", href: "/ops/errors" },
  { name: "Summary", href: "/vessels/summary" },
  { name: "On/Offhire", href: "/vessels/onoffhire" },
  { name: "Incidents", href: "/incidents" },
]

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Navigation */}
        <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
            
            {/* Left: Logo + MSSB STATUS */}
            <div className="flex items-center gap-3">
                <Image
                src="/logo-meridian-large.png"
                alt="Meridian Logo"
                width={40}
                height={40}
                className="rounded"
                />
                <span className="text-lg font-bold tracking-wide text-gray-800">
                MSSB STATUS
                </span>
            </div>

            {/* Center: Navigation Menu */}
            <div className="flex items-center gap-2">
                {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`w-32 text-center px-4 py-2 rounded-lg border transition-all text-sm font-medium
                    ${pathname === item.href
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-black"}`}
                >
                    {item.name}
                </Link>
                ))}
            </div>

            {/* Right: Logout Button */}
            <div className="flex items-center">
                <button
                className="w-32 text-center px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-all"
                >
                Logout
                </button>
            </div>
            </div>
        </div>
        </header>


      {/* Page Content */}
      <main className="flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  )
}
