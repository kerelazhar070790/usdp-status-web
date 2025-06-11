// src/lib/mssql.ts
import sql from 'mssql'

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER!,
  port: Number(process.env.MSSQL_PORT),
  database: process.env.MSSQL_DB,
  options: {
    encrypt: false, // Use false for self-hosted SQL Server
    trustServerCertificate: true,
  },
  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

export async function getMSSQLConnection() {
  try {
    const pool = await sql.connect(config)
    return pool
  } catch (error) {
    console.error('[MSSQL] Connection Error:', error)
    throw error
  }
}
