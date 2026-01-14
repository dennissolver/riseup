// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const [{ count: totalPanels }, { count: totalInterviews }, { data: durations }] = await Promise.all([
      supabase.from('agents').select('*', { count: 'exact', head: true }),
      supabase.from('interviews').select('*', { count: 'exact', head: true }),
      supabase.from('interviews').select('duration_seconds').not('duration_seconds', 'is', null),
    ]);
    const avgDuration = durations?.length ? Math.round(durations.reduce((a, b) => a + (b.duration_seconds || 0), 0) / durations.length / 60) : 0;
    return NextResponse.json({ totalPanels: totalPanels || 0, totalInterviews: totalInterviews || 0, avgDuration });
  } catch { return NextResponse.json({ totalPanels: 0, totalInterviews: 0, avgDuration: 0 }); }
}