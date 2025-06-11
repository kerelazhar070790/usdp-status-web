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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "24h"
  const hours = parseInt(range.replace("h", ""), 10)

  const now = new Date()
  const start = new Date(now.getTime() - hours * 60 * 60 * 1000)

  try {
    const result = await pool.query(`
      SELECT date_trunc('hour', timestamp) AT TIME ZONE 'UTC' AS hour,
        COUNT(*) FILTER (WHERE ping_status = TRUE) AS up_count,
        COUNT(*) AS total_count,
        AVG(latency_ms) FILTER (WHERE ping_status = TRUE) AS avg_latency
      FROM server_health
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY hour
      ORDER BY hour ASC;
    `, [start.toISOString(), now.toISOString()])

    const data = result.rows.map(row => ({
      timestamp: row.hour.toISOString(),
      status: row.up_count > 0 ? 'up' : 'down',
      responseTimeMs: row.avg_latency ? Math.round(row.avg_latency * 100) / 100 : null,
      retries: row.total_count - row.up_count
    }))

    return NextResponse.json(data)
  } catch (err) {
    console.error("DB Error:", err)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }
}
