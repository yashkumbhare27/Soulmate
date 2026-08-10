import { Request, Response } from 'express';
import { ChatMessageModel } from '../models/ChatMessage';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Fetch chat message history for a match
 */
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { matchId } = req.params;

  if (!matchId) {
    res.status(400).json({ error: 'Match ID is required' });
    return;
  }

  try {
    const messages = await ChatMessageModel.find({ matchId })
      .sort({ timestamp: 1 })
      .limit(100); // return last 100 messages

    res.status(200).json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
