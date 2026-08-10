import { StructuredPreferences } from '@soulmate/shared/src/types';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface MockProfile {
  id: string;
  userId: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  location: {
    city: string;
    state: string;
  };
  bio: string;
  photos: string[];
  familySettings: {
    involvementEnabled: boolean;
    familyMemberEmail?: string;
  };
  aiPreferences: {
    rawTranscript: string;
    structuredPrefs: StructuredPreferences;
  };
  trustBadges: {
    idVerified: boolean;
    videoVerified: boolean;
    familyVerified: boolean;
  };
}

export interface MockMatch {
  id: string;
  users: string[]; // User IDs
  compatibilityScore: number;
  aiExplanation: {
    reasoning: string;
    greenFlags: string[];
    redFlags: string[];
    sharedInterests: string[];
  };
  chatWindowExpiry: string;
  status: 'pending' | 'active' | 'continued' | 'expired';
}

export interface MockMessage {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

// Memory Database
export let users: MockUser[] = [
  {
    id: 'priya_id',
    name: 'Priya Sharma',
    email: 'priya.sharma.mock@soulmate.ai',
    phoneNumber: '+919876543210',
    role: 'user',
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'aarav_id',
    name: 'Aarav Mehta',
    email: 'aarav.mehta.mock@soulmate.ai',
    phoneNumber: '+919876543211',
    role: 'user',
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ananya_id',
    name: 'Ananya Iyer',
    email: 'ananya.iyer.mock@soulmate.ai',
    phoneNumber: '+919876543212',
    role: 'user',
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'kabir_id',
    name: 'Kabir Malhotra',
    email: 'kabir.malhotra.mock@soulmate.ai',
    phoneNumber: '+919876543213',
    role: 'user',
    isVerified: true,
    createdAt: new Date().toISOString()
  }
];

export let profiles: MockProfile[] = [
  {
    id: 'priya_profile',
    userId: 'priya_id',
    gender: 'female',
    dateOfBirth: '1996-05-15',
    location: { city: 'Mumbai', state: 'Maharashtra' },
    bio: 'Software engineer at a top tech company. Passionate about classical dance, hiking, and exploring historical monuments across Maharashtra. Value close family ties.',
    photos: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'],
    familySettings: { involvementEnabled: false },
    trustBadges: { idVerified: true, videoVerified: true, familyVerified: false },
    aiPreferences: {
      rawTranscript: 'Seeded search preferences',
      structuredPrefs: {
        ageMin: 21,
        ageMax: 35,
        values: ['Family values', 'Career orientation', 'Mutual respect'],
        lifestyle: ['Vegetarian', 'Teetotaler', 'Early riser'],
        locationPrefs: ['Mumbai'],
        education: ['Bachelors Degree', 'Engineering']
      }
    }
  },
  {
    id: 'aarav_profile',
    userId: 'aarav_id',
    gender: 'male',
    dateOfBirth: '1994-09-22',
    location: { city: 'Pune', state: 'Maharashtra' },
    bio: 'Product manager, food enthusiast, and weekend trekker. Looking for someone who values mutual respect, shares a passion for travel, and enjoys deep conversations.',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'],
    familySettings: { involvementEnabled: false },
    trustBadges: { idVerified: true, videoVerified: true, familyVerified: false },
    aiPreferences: {
      rawTranscript: 'Seeded search preferences',
      structuredPrefs: {
        ageMin: 21,
        ageMax: 35,
        values: ['Career orientation', 'Adventure/Travel', 'Mutual respect'],
        lifestyle: ['Non-vegetarian', 'Occasional drinker', 'Pet lover'],
        locationPrefs: ['Pune'],
        education: ['Masters Degree', 'MBA']
      }
    }
  },
  {
    id: 'ananya_profile',
    userId: 'ananya_id',
    gender: 'female',
    dateOfBirth: '1998-03-08',
    location: { city: 'Mumbai', state: 'Maharashtra' },
    bio: 'Classical musician and educator. Love yoga, organic cooking, and spending peaceful weekends at home. Seeking a spiritual and kind partner.',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'],
    familySettings: { involvementEnabled: false },
    trustBadges: { idVerified: true, videoVerified: true, familyVerified: false },
    aiPreferences: {
      rawTranscript: 'Seeded search preferences',
      structuredPrefs: {
        ageMin: 21,
        ageMax: 35,
        values: ['Family values', 'Spiritual growth', 'Mutual respect'],
        lifestyle: ['Vegetarian', 'Teetotaler', 'Fitness enthusiast'],
        locationPrefs: ['Mumbai'],
        education: ['Masters Degree']
      }
    }
  },
  {
    id: 'kabir_profile',
    userId: 'kabir_id',
    gender: 'male',
    dateOfBirth: '1995-11-30',
    location: { city: 'Mumbai', state: 'Maharashtra' },
    bio: 'Chartered Accountant who loves playing cricket and photography. Looking for a partner to build a warm, supportive home, balancing career aspirations and family values.',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'],
    familySettings: { involvementEnabled: false },
    trustBadges: { idVerified: true, videoVerified: true, familyVerified: false },
    aiPreferences: {
      rawTranscript: 'Seeded search preferences',
      structuredPrefs: {
        ageMin: 21,
        ageMax: 35,
        values: ['Family values', 'Career orientation', 'Financial stability'],
        lifestyle: ['Non-vegetarian', 'Teetotaler', 'Night owl'],
        locationPrefs: ['Mumbai'],
        education: ['Bachelors Degree', 'CA']
      }
    }
  }
];

export let matches: MockMatch[] = [];
export let messages: MockMessage[] = [];

// Helper functions for state
export const addUser = (user: MockUser) => users.push(user);
export const addProfile = (profile: MockProfile) => profiles.push(profile);
export const addMatch = (match: MockMatch) => matches.push(match);
export const addMessage = (message: MockMessage) => messages.push(message);
