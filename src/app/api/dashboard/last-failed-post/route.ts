import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT attempt_time, post_duration_seconds, payload_size_bytes
      FROM post_failure_log 
	  WHERE retry_count = 0
	  AND processed = 'false'
      ORDER BY attempt_time DESC
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error('DB ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
