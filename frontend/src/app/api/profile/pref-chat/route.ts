import { NextResponse } from 'next/server';
import { profiles } from '../../mockDb';

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

    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const userMessagesCount = messages.filter(m => m.role === 'user').length;
    let reply = '';
    let isComplete = false;
    let structuredPrefs: any = null;

    if (userMessagesCount === 0) {
      reply = "Namaste! I am your SoulMate AI match specialist. Let's build your matching profile. What is your preferred age range for a partner?";
    } else if (userMessagesCount === 1) {
      reply = "Got it! And what core values are most important to you in a partner? (e.g. family-oriented, career-focused, spiritual growth, modern worldview)";
    } else if (userMessagesCount === 2) {
      reply = "Perfect. What about their lifestyle? Do you have preferences around dietary habits (vegetarian/non-vegetarian), fitness, or social habits?";
    } else if (userMessagesCount === 3) {
      reply = "Understood. Finally, what about their ideal location (cities or states) and educational background?";
    } else if (userMessagesCount === 4) {
      reply = "Wonderful! I have analyzed our chat and extracted your preferences. Let me compile them for you. Please review and confirm.";
      isComplete = true;

      // Extract mock structured preferences from user inputs
      const transcript = messages.map(m => m.content).join(' ');
      
      const values = ['Family values', 'Mutual respect'];
      if (transcript.toLowerCase().includes('career') || transcript.toLowerCase().includes('job')) values.push('Career orientation');
      if (transcript.toLowerCase().includes('spiritual')) values.push('Spiritual growth');

      const lifestyle = ['Teetotaler'];
      if (transcript.toLowerCase().includes('veg')) lifestyle.push('Vegetarian');
      if (transcript.toLowerCase().includes('fit') || transcript.toLowerCase().includes('gym')) lifestyle.push('Fitness enthusiast');

      structuredPrefs = {
        ageMin: 23,
        ageMax: 33,
        values,
        lifestyle,
        locationPrefs: ['Mumbai', 'Pune'],
        education: ['Bachelors Degree', 'Masters Degree']
      };

      // Save to profile
      const index = profiles.findIndex(p => p.userId === userId);
      if (index !== -1) {
        profiles[index] = {
          ...profiles[index],
          aiPreferences: {
            rawTranscript: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
            structuredPrefs
          }
        };
      }
    } else {
      reply = "Thank you! Your preferences have been saved. You can check your dashboard to see your recommended matches!";
      isComplete = true;
    }

    return NextResponse.json({ reply, isComplete, structuredPrefs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
