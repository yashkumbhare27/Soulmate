import { Schema, model } from 'mongoose';

const MatchSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  compatibilityScore: { type: Number, required: true },
  aiExplanation: {
    reasoning: { type: String, required: true },
    greenFlags: [{ type: String }],
    redFlags: [{ type: String }],
    sharedInterests: [{ type: String }]
  },
  chatWindowExpiry: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'continued', 'expired'], 
    default: 'pending' 
  }
});

MatchSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
MatchSchema.set('toJSON', { virtuals: true });
MatchSchema.set('toObject', { virtuals: true });

export const MatchModel = model('Match', MatchSchema);
