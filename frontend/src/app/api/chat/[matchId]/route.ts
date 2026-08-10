import { NextResponse } from 'next/server';
import { messages, addMessage, users } from '../../mockDb';

function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  return token.replace('mock-jwt-token-for-', '');
}

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = params;
    const roomMessages = messages.filter(m => m.matchId === matchId);

    return NextResponse.json(roomMessages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId } = params;
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text message is required' }, { status: 400 });
    }

    // Save message
    const newMessage = {
      id: 'msg_' + Date.now(),
      matchId,
      senderId: userId,
      text,
      timestamp: new Date().toISOString()
    };
    addMessage(newMessage);

    // Trigger an AI-simulated reply after 1.5 seconds directly in mockDb
    setTimeout(() => {
      const otherUserId = matchId.includes('priya') || matchId.includes('ananya') ? 'priya_id' : 'aarav_id';
      const replies = [
        "That sounds lovely! I really like how our profiles connect.",
        "I agree. Tell me more about what you value in relationships?",
        "That's interesting. I love travelling too, especially trekking in the Western Ghats!",
        "Shall we plan a call or coffee meet? Let's check with our family involvement mode too.",
        "I am happy we matched! The SoulMate AI explanation of our compatibility was spot on."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const simulatedReply = {
        id: 'msg_reply_' + Date.now(),
        matchId,
        senderId: otherUserId,
        text: randomReply,
        timestamp: new Date().toISOString()
      };
      addMessage(simulatedReply);
    }, 1500);

    return NextResponse.json(newMessage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
