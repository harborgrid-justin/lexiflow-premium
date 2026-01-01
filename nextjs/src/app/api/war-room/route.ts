import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'war-room API endpoint' });
}
