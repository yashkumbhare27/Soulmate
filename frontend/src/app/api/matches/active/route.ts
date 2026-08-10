import { NextResponse } from 'next/server';
import { matches, profiles, users } from '../../mockDb';

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

    const activeMatches = matches.filter(m => m.users.includes(userId) && m.status === 'active');
    
    const result = activeMatches.map(match => {
      const otherUserId = match.users.find(id => id !== userId);
      const otherUser = users.find(u => u.id === otherUserId);
      const otherProfile = profiles.find(p => p.userId === otherUserId);

      return {
        matchId: match.id,
        compatibilityScore: match.compatibilityScore,
        chatWindowExpiry: match.chatWindowExpiry,
        otherUser: otherUser ? { _id: otherUser.id, name: otherUser.name, email: otherUser.email } : null,
        otherProfile: otherProfile ? { photos: otherProfile.photos, bio: otherProfile.bio } : null
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
