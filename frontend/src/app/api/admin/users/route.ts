import { NextResponse } from 'next/server';
import { users, profiles } from '../../mockDb';

export async function GET(request: Request) {
  try {
    const result = users.map(user => {
      const profile = profiles.find(p => p.userId === user.id);
      return {
        user,
        profile
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
