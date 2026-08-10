import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    if (!phoneNumber) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }
    console.log(`[Vercel Serverless OTP] Simulated code for ${phoneNumber} is: 123456`);
    return NextResponse.json({ message: 'OTP sent (Simulated: use code 123456)' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
