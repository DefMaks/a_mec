import { NextRequest, NextResponse } from 'next/server';
import { fetchSessionDichotomy } from '@/lib/session-data';
import { SessionRole } from '@/types/session.types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = (searchParams.get('role') || 'admin') as SessionRole;
    const profileId = searchParams.get('profile_id') || null;
    const eleveId = searchParams.get('eleve_id') || null;

    const data = await fetchSessionDichotomy(roleParam, profileId, eleveId);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Erreur lors de la récupération de la session',
      },
      { status: 500 }
    );
  }
}
