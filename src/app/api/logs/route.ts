import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Fix PG timestamp parsing (no auto UTC conversion)
import pg from 'pg'
pg.types.setTypeParser(1114, str => str) // timestamp without time zone

dayjs.extend(utc)
dayjs.extend(timezone)

// Setup PostgreSQL connection using env variables
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
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '10')
    const search = searchParams.get('search')?.trim() || ''

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'Missing date filters' }, { status: 400 })
    }

console.log('[LOGS API] selected startDateStr:', startDateStr)
console.log('[LOGS API] selected endDateStr:', endDateStr)

// Convert selected MYT date to correct UTC range: 16:00 previous day to 15:59:59.999
const startUtc = dayjs.tz(`${startDateStr} 00:00:00`, 'Asia/Kuala_Lumpur').utc().toISOString()
const endUtc = dayjs.tz(`${endDateStr} 23:59:59.999`, 'Asia/Kuala_Lumpur').utc().toISOString()

console.log('[LOGS API] startUtc:', startUtc)  // Expect: 2025-06-12T16:00:00.000Z
console.log('[LOGS API] endUtc:', endUtc)      // Expect: 2025-06-13T15:59:59.999Z

    const offset = (page - 1) * limit
    const values: any[] = [startUtc, endUtc]
    let whereClause = `WHERE attempt_time >= $1 AND attempt_time <= $2`
    let limitOffsetIndex = 3

    if (search) {
      whereClause += ` AND (LOWER(vessel_name) LIKE $3 OR CAST(vessel_id AS TEXT) LIKE $3)`
      values.push(`%${search.toLowerCase()}%`)
      limitOffsetIndex = 4
    }

    const dataQuery = `
      SELECT vessel_id, vessel_name, rdatetime, attempt_time, payload_id,payload,
             post_duration_seconds, payload_size_bytes, response_code, success
      FROM vts_push_log
      ${whereClause}
      ORDER BY attempt_time DESC
      LIMIT $${limitOffsetIndex}
      OFFSET $${limitOffsetIndex + 1}
    `

    const countQuery = `
      SELECT COUNT(*) FROM vts_push_log
      ${whereClause}
    `

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [...values, limit, offset]),
      pool.query(countQuery, values),
    ])

    if (dataResult.rows.length > 0) {
  console.log('[LOGS API] Oldest row (UTC):', dataResult.rows[dataResult.rows.length - 1].attempt_time)
  console.log('[LOGS API] Newest row (UTC):', dataResult.rows[0].attempt_time)
}

    return NextResponse.json({
      logs: dataResult.rows,
      totalCount: Number(countResult.rows[0].count),
      currentPage: page,
      totalPages: Math.ceil(Number(countResult.rows[0].count) / limit),
    })
  } catch (error) {
    console.error('Error in /api/logs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
