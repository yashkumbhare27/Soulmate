import { NextResponse } from 'next/server';
import { profiles, users } from '../../mockDb';

function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  return token.replace('mock-jwt-token-for-', '');
}

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = profiles.find(p => p.userId === userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const user = users.find(u => u.id === userId);
    const result = {
      ...profile,
      userId: user ? { _id: user.id, name: user.name, email: user.email, phoneNumber: user.phoneNumber } : null
    };

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
