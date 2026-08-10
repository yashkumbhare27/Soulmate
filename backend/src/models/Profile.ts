import { Schema, model } from 'mongoose';

const ProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  dateOfBirth: { type: Date, required: true },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  bio: { type: String, default: '' },
  photos: [{ type: String }],
  familySettings: {
    involvementEnabled: { type: Boolean, default: false },
    familyMemberEmail: { type: String }
  },
  aiPreferences: {
    rawTranscript: { type: String, default: '' },
    structuredPrefs: {
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 70 },
      values: [{ type: String }],
      lifestyle: [{ type: String }],
      locationPrefs: [{ type: String }],
      education: [{ type: String }]
    }
  },
  trustBadges: {
    idVerified: { type: Boolean, default: false },
    videoVerified: { type: Boolean, default: false },
    familyVerified: { type: Boolean, default: false }
  }
});

ProfileSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
ProfileSchema.set('toJSON', { virtuals: true });
ProfileSchema.set('toObject', { virtuals: true });

export const ProfileModel = model('Profile', ProfileSchema);
