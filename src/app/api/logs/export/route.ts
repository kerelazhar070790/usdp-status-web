import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import pg from 'pg'

pg.types.setTypeParser(1114, str => str)
dayjs.extend(utc)
dayjs.extend(timezone)

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const search = searchParams.get('search')?.trim() || ''

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'Missing date filters' }, { status: 400 })
    }

    const startUtc = dayjs.tz(`${startDateStr} 00:00:00`, 'Asia/Kuala_Lumpur').utc().toISOString()
    const endUtc = dayjs.tz(`${endDateStr} 23:59:59.999`, 'Asia/Kuala_Lumpur').utc().toISOString()

    const values: any[] = [startUtc, endUtc]
    let whereClause = `WHERE attempt_time >= $1 AND attempt_time <= $2`
    let paramIndex = 3

    if (search) {
      whereClause += ` AND (LOWER(vessel_name) LIKE $3 OR CAST(vessel_id AS TEXT) LIKE $3)`
      values.push(`%${search.toLowerCase()}%`)
      paramIndex = 4
    }

    const query = `
      SELECT vessel_id, vessel_name, rdatetime, attempt_time, payload_id,
             payload, post_duration_seconds, payload_size_bytes, response_code, success
      FROM vts_push_log
      ${whereClause}
      ORDER BY attempt_time DESC
    `

    const result = await pool.query(query, values)
    return NextResponse.json({ logs: result.rows })
  } catch (err) {
    console.error('EXPORT ERROR:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
