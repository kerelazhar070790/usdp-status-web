// route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const startDateStr = searchParams.get('startDate')
  const endDateStr = searchParams.get('endDate')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const search = searchParams.get('search') || ''

  if (!startDateStr || !endDateStr) {
    return NextResponse.json({ error: 'Missing startDate or endDate' }, { status: 400 })
  }

  // Convert MYT to UTC range
  const startUtc = dayjs(`${startDateStr}T00:00:00+08:00`).utc().format('YYYY-MM-DD HH:mm:ss')
  const endUtc = dayjs(`${endDateStr}T23:59:59+08:00`).utc().format('YYYY-MM-DD HH:mm:ss')

  const offset = (page - 1) * limit
  const values: any[] = []
  let whereClause = `WHERE attempt_time BETWEEN $1 AND $2`
  values.push(startUtc, endUtc)

  if (search) {
    whereClause += ` AND (LOWER(vessel_name) LIKE $3 OR CAST(vessel_id AS TEXT) LIKE $3)`
    values.push(`%${search.toLowerCase()}%`)
  }

  const dataQuery = `
    SELECT vessel_id, vessel_name, rdatetime, attempt_time, payload_id,
           post_duration_seconds, payload_size_bytes, response_code, success
    FROM vts_push_log
    ${whereClause}
    ORDER BY attempt_time DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `

  const countQuery = `SELECT COUNT(*) FROM vts_push_log ${whereClause}`

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [...values, limit, offset]),
      pool.query(countQuery, values),
    ])

    const totalCount = parseInt(countResult.rows[0].count, 10)
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      logs: dataResult.rows,
      total: totalCount,
      totalPages,
    })
  } catch (error) {
    console.error('Query error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
