import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'control-plane',
    timestamp: new Date().toISOString(),
  });
}
