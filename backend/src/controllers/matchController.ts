import { Request, Response } from 'express';
import { ProfileModel } from '../models/Profile';
import { UserModel } from '../models/User';
import { MatchModel } from '../models/Match';
import { generateMatchExplanation } from '../services/ai';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Fetch candidate profiles for the swipe deck
 */
export const getRecommendedMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const myUserId = req.user.userId;

    // Fetch my profile to get preferences
    const myProfile = await ProfileModel.findOne({ userId: myUserId });
    if (!myProfile) {
      res.status(404).json({ error: 'Profile not found. Please complete profile onboarding.' });
      return;
    }

    // Fetch already swiped or active matches to exclude them
    const existingMatches = await MatchModel.find({
      users: myUserId
    });
    const excludedUserIds = existingMatches.reduce((acc: string[], match) => {
      match.users.forEach(id => {
        if (id.toString() !== myUserId) {
          acc.push(id.toString());
        }
      });
      return acc;
    }, []);
    excludedUserIds.push(myUserId);

    // Fetch candidates
    const candidates = await ProfileModel.find({
      userId: { $nin: excludedUserIds }
    }).populate('userId', 'name email phoneNumber');

    // Score candidates against my preferences
    const matchesFeed = [];
    for (const candidate of candidates) {
      // Run AI compatibility generator (falls back to mock analysis if no OpenAI API Key is configured)
      const analysis = await generateMatchExplanation(myProfile, candidate);
      
      matchesFeed.push({
        profile: candidate,
        compatibilityScore: analysis.compatibilityScore,
        aiExplanation: analysis.aiExplanation
      });
    }

    // Sort by compatibility score descending
    matchesFeed.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json(matchesFeed);
  } catch (error: any) {
    console.error('Error in getRecommendedMatches:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process a user swipe (like or pass)
 */
export const swipeMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  const { candidateUserId, action } = req.body; // action: 'like' | 'pass'
  const myUserId = req.user.userId;

  if (!candidateUserId || !action) {
    res.status(400).json({ error: 'Candidate User ID and action are required' });
    return;
  }

  try {
    if (action === 'pass') {
      // Create a rejected match or simply record the swipe
      const match = new MatchModel({
        users: [myUserId, candidateUserId],
        compatibilityScore: 0,
        aiExplanation: { reasoning: 'Passed', greenFlags: [], redFlags: [], sharedInterests: [] },
        chatWindowExpiry: new Date(),
        status: 'expired'
      });
      await match.save();
      res.status(200).json({ matchCreated: false, status: 'passed' });
      return;
    }

    // If 'like', check if candidate already liked us
    // To do this simply in MVP, we look for a 'pending' match created by the candidate
    const reciprocalMatch = await MatchModel.findOne({
      users: { $all: [myUserId, candidateUserId] },
      status: 'pending'
    });

    if (reciprocalMatch) {
      // It's a mutual match! Update status to active and set the 7-day countdown
      reciprocalMatch.status = 'active';
      reciprocalMatch.chatWindowExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await reciprocalMatch.save();

      res.status(200).json({ 
        matchCreated: true, 
        match: reciprocalMatch, 
        status: 'active',
        message: 'It is a Match! AI Compatibility confirmed.'
      });
      return;
    }

    // If no reciprocal match yet, create a pending match
    // First, let's pre-generate AI compatibility so it's ready
    const myProfile = await ProfileModel.findOne({ userId: myUserId });
    const candidateProfile = await ProfileModel.findOne({ userId: candidateUserId });

    const analysis = await generateMatchExplanation(myProfile, candidateProfile);

    const pendingMatch = new MatchModel({
      users: [myUserId, candidateUserId],
      compatibilityScore: analysis.compatibilityScore,
      aiExplanation: analysis.aiExplanation,
      chatWindowExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // pre-calculate expiry
      status: 'pending'
    });
    await pendingMatch.save();

    res.status(200).json({ matchCreated: false, match: pendingMatch, status: 'pending' });
  } catch (error: any) {
    console.error('Error in swipeMatch:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fetch detailed match details for display
 */
export const getMatchDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { matchId } = req.params;
  try {
    const match = await MatchModel.findById(matchId).populate({
      path: 'users',
      select: 'name email phoneNumber'
    });

    if (!match) {
      res.status(404).json({ error: 'Match connection not found' });
      return;
    }

    // Fetch profiles of both users
    const profiles = await ProfileModel.find({
      userId: { $in: match.users.map((u: any) => u._id) }
    });

    res.status(200).json({
      match,
      profiles
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fetch active matches for chat list
 */
export const getActiveMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const myUserId = req.user.userId;
    const matches = await MatchModel.find({
      users: myUserId,
      status: 'active'
    }).populate({
      path: 'users',
      select: 'name email phoneNumber'
    });

    // For each match, find the other user's profile photo
    const result = [];
    for (const match of matches) {
      const otherUser = match.users.find((u: any) => u._id.toString() !== myUserId);
      const otherProfile = await ProfileModel.findOne({ userId: otherUser?._id });
      result.push({
        matchId: match._id,
        compatibilityScore: match.compatibilityScore,
        chatWindowExpiry: match.chatWindowExpiry,
        otherUser,
        otherProfile
      });
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
