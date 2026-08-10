import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { ProfileModel } from '../models/Profile';

const JWT_SECRET = process.env.JWT_SECRET || 'soulmate-jwt-secret-key-12345';

/**
 * OTP request controller. Simulates sending an OTP code.
 */
export const requestOTP = async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    res.status(400).json({ message: 'Phone number is required' });
    return;
  }
  
  console.log(`[OTP Sent] Simulated OTP for ${phoneNumber} is: 123456`);
  res.status(200).json({ message: 'OTP sent successfully (Simulated: use code 123456)' });
};

/**
 * Login / Verify OTP controller.
 * If user exists, returns JWT token.
 * If user does not exist, registers user and returns JWT token.
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, otp, email, name, gender, city, state, dateOfBirth } = req.body;

  if (!phoneNumber || !otp) {
    res.status(400).json({ error: 'Phone number and OTP are required' });
    return;
  }

  // Verification code check
  if (otp !== '123456') {
    res.status(400).json({ error: 'Invalid OTP code. Use 123456' });
    return;
  }

  try {
    let user = await UserModel.findOne({ phoneNumber });
    let isNewUser = false;

    if (!user) {
      if (!email || !name) {
        res.status(200).json({ 
          needsRegistration: true, 
          message: 'User not found. Please provide name and email to sign up.' 
        });
        return;
      }

      // Create new user
      user = new UserModel({
        name,
        email,
        phoneNumber,
        isVerified: true
      });
      await user.save();
      isNewUser = true;

      // Create initial empty profile
      const newProfile = new ProfileModel({
        userId: user._id,
        gender: gender || 'other',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1998-01-01'),
        location: {
          city: city || 'Mumbai',
          state: state || 'Maharashtra'
        },
        bio: '',
        photos: [],
        trustBadges: {
          idVerified: false,
          videoVerified: false,
          familyVerified: false
        }
      });
      await newProfile.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified
      },
      isNewUser
    });
  } catch (error: any) {
    console.error('Error during OTP verification:', error);
    res.status(500).json({ error: 'Verification failed: ' + error.message });
  }
};
