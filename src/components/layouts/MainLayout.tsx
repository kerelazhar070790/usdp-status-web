'use client'

import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

const router = useRouter()

const handleLogout = async () => {
  try {
    const res = await fetch("/api/logout", {
      method: "POST",
    })
    if (res.ok) {
      router.push("/login")
    } else {
      console.error("Logout error", await res.text())
    }
  } catch (err) {
    console.error("Logout failed", err)
  }
}


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Header - seamless */}
      <header className="bg-gray-100 border-b">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo + System Name */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo-meridian-xsmall.png"
              alt="Meridian Logo"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-lg font-semibold text-gray-800">MSSB POST STATUS</span>
          </div>

        {/* Logout */}
        <div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-black"
          >
            Logout
          </button>
        </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer - Flare-style */}
        <footer className="w-full border-t bg-gray-100 py-4">
          <div className="max-w-6xl mx-auto px-4 flex justify-between text-sm text-gray-500">
            {/* Left: Footer Nav Links with even spacing */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Logs', href: '/ops/logs' },
                { name: 'Errors', href: '/ops/errors' },
                { name: 'Summary', href: '/vessels/summary' },
                { name: 'On/Offhire', href: '/vessels/onoffhire' },
                { name: 'Incidents', href: '/incidents' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-black ${
                    pathname === link.href ? 'font-semibold text-black' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right: Attribution */}
            <div className="text-right whitespace-nowrap">
              Powered by <strong>MVMCC</strong>
            </div>
          </div>
        </footer>
    </div>
  )
}
