import { NextResponse } from 'next/server';
import { users, profiles, addUser, addProfile } from '../../mockDb';

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp, email, name, gender, city, state } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
    }

    if (otp !== '123456') {
      return NextResponse.json({ error: 'Invalid OTP. Use 123456' }, { status: 400 });
    }

    let user = users.find(u => u.phoneNumber === phoneNumber);
    let isNewUser = false;

    if (!user) {
      if (!email || !name) {
        return NextResponse.json({ needsRegistration: true, message: 'User not found. Provide registration fields.' });
      }

      // Create user
      const newUserId = 'user_' + Date.now();
      user = {
        id: newUserId,
        name,
        email,
        phoneNumber,
        role: 'user',
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      addUser(user);
      isNewUser = true;

      // Create profile
      const newProfileId = 'profile_' + Date.now();
      const newProfile = {
        id: newProfileId,
        userId: newUserId,
        gender: gender || 'other',
        dateOfBirth: '1998-01-01',
        location: { city: city || 'Mumbai', state: state || 'Maharashtra' },
        bio: `Hi, I am ${name}. Seeded matrimonial profile.`,
        photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'],
        familySettings: { involvementEnabled: false },
        trustBadges: { idVerified: true, videoVerified: false, familyVerified: false },
        aiPreferences: {
          rawTranscript: '',
          structuredPrefs: {
            ageMin: 22,
            ageMax: 32,
            values: ['Family values', 'Mutual respect'],
            lifestyle: ['Teetotaler'],
            locationPrefs: [city || 'Mumbai'],
            education: ['Bachelors Degree']
          }
        }
      };
      addProfile(newProfile);
    }

    // Mock token
    const token = `mock-jwt-token-for-${user.id}`;

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified
      },
      isNewUser
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
