// src/app/api/dashboard/active-vessel-count/route.ts
import { NextResponse } from 'next/server'
import { getMSSQLConnection } from '@/lib/mssql'

export async function GET() {
  try {
    const pool = await getMSSQLConnection()

    const result = await pool.request().query(`
      SELECT COUNT(*) as total
      FROM Vessels
      WHERE UseME = 1
        AND Charterer IN ('Petronas','PFLNGSatu')
        AND Owner NOT LIKE '%Helicopter%'
    `)

    const total = result.recordset[0]?.total || 0

    return NextResponse.json({ total })
  } catch (error) {
    console.error('[API] Active Vessel Count Error:', error)
    return NextResponse.json({ error: 'Failed to fetch active vessel count' }, { status: 500 })
  }
}
