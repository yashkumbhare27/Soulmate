export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface StructuredPreferences {
  ageMin: number;
  ageMax: number;
  values: string[];
  lifestyle: string[];
  locationPrefs: string[];
  education: string[];
}

export interface Profile {
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

export interface MatchExplanation {
  reasoning: string;
  greenFlags: string[];
  redFlags: string[];
  sharedInterests: string[];
}

export interface Match {
  id: string;
  users: string[]; // Two User IDs or User objects depending on populate
  compatibilityScore: number;
  aiExplanation: MatchExplanation;
  chatWindowExpiry: string;
  status: 'pending' | 'active' | 'continued' | 'expired';
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: string;
}
