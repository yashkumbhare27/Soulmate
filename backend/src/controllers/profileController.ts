import { Request, Response } from 'express';
import { ProfileModel } from '../models/Profile';
import { extractPreferences } from '../services/ai';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Fetch profile for the authenticated user
 */
export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await ProfileModel.findOne({ userId: req.user.userId }).populate('userId', 'name email phoneNumber');
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update profile details manually
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await ProfileModel.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle AI conversational preference onboarding logic
 */
export const preferenceChat = async (req: AuthRequest, res: Response): Promise<void> => {
  const { messages } = req.body; // Array of { role: 'user'|'assistant', content: string }
  
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Messages transcript is required' });
    return;
  }

  try {
    // Generate responses based on conversation length (state-machine conversational agent)
    const userMessagesCount = messages.filter(m => m.role === 'user').length;
    let reply = '';
    let isComplete = false;

    if (userMessagesCount === 0) {
      reply = "Namaste! I am your SoulMate AI match specialist. Let's build your matching profile. What is your preferred age range for a partner?";
    } else if (userMessagesCount === 1) {
      reply = "Got it! And what core values are most important to you in a partner? (e.g. family-oriented, career-focused, spiritual growth, modern worldview)";
    } else if (userMessagesCount === 2) {
      reply = "Perfect. What about their lifestyle? Do you have preferences around dietary habits (vegetarian/non-vegetarian), fitness, or social habits?";
    } else if (userMessagesCount === 3) {
      reply = "Understood. Finally, what about their ideal location (cities or states) and educational background?";
    } else if (userMessagesCount === 4) {
      reply = "Wonderful! I have analyzed our chat and extracted your preferences. Let me compile them for you. Please review and confirm.";
      isComplete = true;
    } else {
      reply = "Thank you! Your preferences have been saved. You can check your dashboard to see your recommended matches!";
      isComplete = true;
    }

    // If complete, extract structured preferences from transcript using OpenAI or mock service
    if (isComplete) {
      const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      const structuredPrefs = await extractPreferences(transcript);
      
      // Update profile with preferences
      await ProfileModel.findOneAndUpdate(
        { userId: req.user.userId },
        { 
          $set: { 
            'aiPreferences.rawTranscript': transcript,
            'aiPreferences.structuredPrefs': structuredPrefs
          } 
        }
      );
      
      res.status(200).json({ reply, isComplete, structuredPrefs });
      return;
    }

    res.status(200).json({ reply, isComplete });
  } catch (error: any) {
    console.error('Error in preferenceChat controller:', error);
    res.status(500).json({ error: error.message });
  }
};
