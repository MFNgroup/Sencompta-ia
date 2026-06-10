import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export async function GET() {
  try {
    const rows = await query('SELECT 1 AS ok, NOW() AS server_time');
    return NextResponse.json({ status: 'connected', server_time: rows[0].server_time, db_host: process.env.DB_HOST });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message, code: err.code, db_host: process.env.DB_HOST }, { status: 500 });
  }
}
