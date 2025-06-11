import { Pool } from 'pg'
import { NextResponse } from 'next/server'

// Setup PostgreSQL connection using env variables
const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '24h'

  let durationHours = 24
  if (range === '7d') durationHours = 168
  else if (range === '30d') durationHours = 720
  else if (range === '90d') durationHours = 2160

  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)

  try {
    const result = await pool.query(
      `
        SELECT 
        received_at AT TIME ZONE 'UTC' AS received_at, 
        post_duration_seconds, 
        payload_size_bytes 
      FROM mock_post_log 
      WHERE received_at >= $1 AND received_at <= $2 
      ORDER BY received_at ASC
      `,
      [startTime.toISOString(), endTime.toISOString()]
    )

    const data = result.rows.map(row => ({
      timestamp: row.received_at,
      postDuration: Number(row.post_duration_seconds) || 0,
      payloadSize: Number(row.payload_size_bytes) || 0,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API] post-duration error:', error)
    return NextResponse.json({ error: 'Failed to fetch post duration data' }, { status: 500 })
  }
}
