import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'\;

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/docket`);
    if (!res.ok) {
      // If backend endpoint doesn't exist yet, return mock data to keep UI working
      if (res.status === 404) {
         return NextResponse.json([
            { id: '1', caseId: 'CASE-001', filingDate: '2025-01-01', description: 'Complaint Filed', filedBy: 'Plaintiff', status: 'Filed' },
            { id: '2', caseId: 'CASE-001', filingDate: '2025-01-02', description: 'Summons Issued', filedBy: 'Court', status: 'Issued' }
         ]);
      }
      return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Backend fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
