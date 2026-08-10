import { NextResponse } from 'next/server';
import { profiles, users, matches } from '../../mockDb';

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

    const myProfile = profiles.find(p => p.userId === userId);
    if (!myProfile) {
      return NextResponse.json({ error: 'Profile not completed' }, { status: 404 });
    }

    // Get profiles of other users we haven't matched/passed on
    const existingSwipes = matches.filter(m => m.users.includes(userId));
    const swipedUserIds = existingSwipes.reduce((acc: string[], match) => {
      match.users.forEach(id => {
        if (id !== userId) acc.push(id);
      });
      return acc;
    }, []);
    
    // Always exclude current user
    swipedUserIds.push(userId);

    const candidates = profiles.filter(p => !swipedUserIds.includes(p.userId));

    const result = candidates.map(candidate => {
      const user = users.find(u => u.id === candidate.userId);
      const isSameCity = myProfile.location.city.toLowerCase() === candidate.location.city.toLowerCase();
      
      let score = 84;
      if (isSameCity) score += 6;
      if (candidate.gender !== myProfile.gender) score += 4;

      const greenFlags = [
        `Both value ${myProfile.aiPreferences?.structuredPrefs?.values?.[0] || 'close family ties'}.`,
        isSameCity ? `Both reside in ${myProfile.location.city}, reducing geographical friction.` : `Both willing to relocate within Maharashtra.`,
        `Complementary views on career development and home values.`
      ];

      const redFlags = [
        `Slight differences in social outing frequency preference.`
      ];

      const sharedInterests = ['Travel', 'Family Gatherings', 'Movies', 'Indian Cuisine'];

      const reasoning = `You share a ${score}% match because both of you prioritize ${myProfile.aiPreferences?.structuredPrefs?.values?.[0] || 'matrimonial growth'} and share closely matching lifestyle values. ${isSameCity ? `Living in the same city (${myProfile.location.city}) makes physical family meetings simple.` : `Living nearby in ${myProfile.location.city} and ${candidate.location.city} connects your search location parameters.`} This creates a solid baseline for further discussion.`;

      return {
        profile: {
          ...candidate,
          userId: user ? { _id: user.id, name: user.name, email: user.email, phoneNumber: user.phoneNumber } : null
        },
        compatibilityScore: Math.min(score, 98),
        aiExplanation: {
          reasoning,
          greenFlags,
          redFlags,
          sharedInterests
        }
      };
    });

    // Sort by compatibility
    result.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
