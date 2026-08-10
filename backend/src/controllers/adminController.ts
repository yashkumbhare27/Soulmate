import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { ProfileModel } from '../models/Profile';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Fetch all users and profiles for admin management
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find().select('name email phoneNumber role isVerified createdAt');
    const result = [];

    for (const user of users) {
      const profile = await ProfileModel.findOne({ userId: user._id });
      result.push({
        user,
        profile
      });
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle trust badges for a specific user profile
 */
export const toggleBadge = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId, badgeField, value } = req.body; // badgeField: 'idVerified' | 'videoVerified' | 'familyVerified'

  if (!userId || !badgeField) {
    res.status(400).json({ error: 'User ID and badge field are required' });
    return;
  }

  try {
    const updateKey = `trustBadges.${badgeField}`;
    const profile = await ProfileModel.findOneAndUpdate(
      { userId },
      { $set: { [updateKey]: !!value } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.status(200).json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
