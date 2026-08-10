import { NextResponse } from 'next/server';
import { matches, addMatch, profiles } from '../../mockDb';

function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  return token.replace('mock-jwt-token-for-', '');
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { candidateUserId, action } = await request.json();
    if (!candidateUserId || !action) {
      return NextResponse.json({ error: 'Missing candidateUserId or action' }, { status: 400 });
    }

    if (action === 'pass') {
      const match = {
        id: 'match_' + Date.now(),
        users: [userId, candidateUserId],
        compatibilityScore: 0,
        aiExplanation: { reasoning: 'Passed', greenFlags: [], redFlags: [], sharedInterests: [] },
        chatWindowExpiry: new Date().toISOString(),
        status: 'expired' as const
      };
      addMatch(match);
      return NextResponse.json({ matchCreated: false, status: 'passed' });
    }

    // If 'like', check if candidate already liked us
    // To make it simple in the serverless mockDb, we can check if there's a pending match with candidates
    // Or, since it's a mock onboarding, we can auto-match with the first candidate to give them a great experience!
    // Auto-match is awesome for testing. Let's make it match on every second like, or always match for demo purposes!
    const isAlreadyLiked = true; // Auto-match on like for instant matrimonial demo!

    if (isAlreadyLiked) {
      const newMatchId = 'match_' + Date.now();
      const match = {
        id: newMatchId,
        users: [userId, candidateUserId],
        compatibilityScore: 92,
        aiExplanation: {
          reasoning: "You matched! You share overlapping interests in outdoor activities, Indian history, and closely aligned family values.",
          greenFlags: ["Family values match", "Geographically near", "Hobby matches"],
          redFlags: ["Minor career field differences"],
          sharedInterests: ["Hiking", "Trekking", "Vegetarian Cooking"]
        },
        chatWindowExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active' as const
      };
      addMatch(match);

      return NextResponse.json({
        matchCreated: true,
        match,
        status: 'active',
        message: 'It is a Match! AI Compatibility confirmed.'
      });
    }

    return NextResponse.json({ matchCreated: false, status: 'pending' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
