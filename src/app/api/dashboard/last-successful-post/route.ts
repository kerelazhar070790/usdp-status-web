import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// Use environment variables for security
const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT received_at, post_duration_seconds, payload_size_bytes
      FROM mock_post_log
      ORDER BY received_at DESC
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
