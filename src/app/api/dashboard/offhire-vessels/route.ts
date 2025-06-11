import { NextResponse } from 'next/server'
import { getMSSQLConnection } from '@/lib/mssql'

export async function GET() {
  try {
    const pool = await getMSSQLConnection()

    // Calculate UTC window: 16:00 yesterday to 15:59 today
    const now = new Date()
    const today = new Date(now.toISOString().split('T')[0])
    const start = new Date(today.getTime() - 8 * 60 * 60 * 1000) // 16:00 previous day UTC
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1) // 15:59 today UTC

    const startStr = start.toISOString().slice(0, 19).replace('T', ' ')
    const endStr = end.toISOString().slice(0, 19).replace('T', ' ')

    const query = `
      SELECT onoffhire.vesselid, vessels.name, onoffhire.HireDateTimeUTC,
             FORMAT(DATEADD(HOUR, 8, onoffhire.HireDateTimeUTC), 'dd/MM/yyyy HH:mm:ss') AS HireDateTimeMYT
      FROM onoffhire
      FULL JOIN vessels ON onoffhire.vesselid = vessels.id
      WHERE onoffhire.charterer IN ('PETRONAS', 'PFLNGSatu')
        AND onoffhire.HireDateTimeUTC >= @start
        AND onoffhire.HireDateTimeUTC <= @end
        AND onoffhire.onoffhire = 'Off'
      ORDER BY onoffhire.HireDateTimeUTC DESC
    `

    const result = await pool.request()
      .input('start', startStr)
      .input('end', endStr)
      .query(query)

    return NextResponse.json({
      total: result.recordset.length,
      vessels: result.recordset.map(row => ({
        vesselid: row.vesselid,
        name: row.name,
        hireDateTimeMYT: row.HireDateTimeMYT,
      })),
    })
  } catch (error) {
    console.error('[API] Off-Hire Vessel Error:', error)
    return NextResponse.json({ error: 'Failed to fetch off-hire vessels' }, { status: 500 })
  }
}
