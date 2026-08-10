import { NextResponse } from 'next/server';
import { profiles } from '../../mockDb';

export async function POST(request: Request) {
  try {
    const { userId, badgeField, value } = await request.json();

    if (!userId || !badgeField) {
      return NextResponse.json({ error: 'Missing userId or badgeField' }, { status: 400 });
    }

    const index = profiles.findIndex(p => p.userId === userId);
    if (index === -1) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const trustBadges = profiles[index].trustBadges;
    profiles[index] = {
      ...profiles[index],
      trustBadges: {
        ...trustBadges,
        [badgeField]: !!value
      }
    };

    return NextResponse.json({ success: true, profile: profiles[index] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
