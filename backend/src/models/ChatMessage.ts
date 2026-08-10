import { Schema, model } from 'mongoose';

const ChatMessageSchema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

ChatMessageSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
ChatMessageSchema.set('toJSON', { virtuals: true });
ChatMessageSchema.set('toObject', { virtuals: true });

export const ChatMessageModel = model('ChatMessage', ChatMessageSchema);
