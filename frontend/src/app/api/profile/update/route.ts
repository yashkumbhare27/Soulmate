import { NextResponse } from 'next/server';
import { profiles } from '../../mockDb';

function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  return token.replace('mock-jwt-token-for-', '');
}

export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const index = profiles.findIndex(p => p.userId === userId);
    if (index === -1) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const updates = await request.json();
    profiles[index] = {
      ...profiles[index],
      ...updates
    };

    return NextResponse.json(profiles[index]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
