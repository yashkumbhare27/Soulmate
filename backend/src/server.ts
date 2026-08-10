import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { initSockets } from './sockets/chat';
import { authenticateToken } from './middleware/auth';

// Import Controllers
import * as authController from './controllers/authController';
import * as profileController from './controllers/profileController';
import * as matchController from './controllers/matchController';
import * as chatController from './controllers/chatController';
import * as adminController from './controllers/adminController';

// Seed helper
import { UserModel } from './models/User';
import { ProfileModel } from './models/Profile';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development accessibility; configure tightly in prod
    methods: ['GET', 'POST', 'PUT']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// 1. Auth
app.post('/api/auth/otp', authController.requestOTP);
app.post('/api/auth/verify', authController.verifyOTP);

// 2. Profile (Authenticated)
app.get('/api/profile/me', authenticateToken as any, profileController.getMyProfile as any);
app.put('/api/profile/update', authenticateToken as any, profileController.updateProfile as any);
app.post('/api/profile/pref-chat', authenticateToken as any, profileController.preferenceChat as any);

// 3. Matches (Authenticated)
app.get('/api/matches/recommendations', authenticateToken as any, matchController.getRecommendedMatches as any);
app.post('/api/matches/swipe', authenticateToken as any, matchController.swipeMatch as any);
app.get('/api/matches/active', authenticateToken as any, matchController.getActiveMatches as any);
app.get('/api/matches/:matchId', authenticateToken as any, matchController.getMatchDetail as any);

// 4. Chat History
app.get('/api/chat/:matchId', authenticateToken as any, chatController.getChatHistory as any);

// 5. Admin Panel (Authenticated)
app.get('/api/admin/users', authenticateToken as any, adminController.getAllUsers as any);
app.post('/api/admin/verify', authenticateToken as any, adminController.toggleBadge as any);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Seed data function to populate mock profiles if DB is empty
const seedDatabase = async () => {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding database with mock matrimonial profiles...');

    const mockProfiles = [
      {
        name: 'Priya Sharma',
        email: 'priya.sharma.mock@soulmate.ai',
        phone: '+919876543210',
        gender: 'female',
        dob: '1996-05-15',
        city: 'Mumbai',
        state: 'Maharashtra',
        bio: 'Software engineer at a top tech company. Passionate about classical dance, hiking, and exploring historical monuments across Maharashtra. Value close family ties.',
        values: ['Family values', 'Career orientation', 'Mutual respect'],
        lifestyle: ['Vegetarian', 'Teetotaler', 'Early riser'],
        education: ['Bachelors Degree', 'Engineering'],
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Aarav Mehta',
        email: 'aarav.mehta.mock@soulmate.ai',
        phone: '+919876543211',
        gender: 'male',
        dob: '1994-09-22',
        city: 'Pune',
        state: 'Maharashtra',
        bio: 'Product manager, food enthusiast, and weekend trekker. Looking for someone who values mutual respect, shares a passion for travel, and enjoys deep conversations.',
        values: ['Career orientation', 'Adventure/Travel', 'Mutual respect'],
        lifestyle: ['Non-vegetarian', 'Occasional drinker', 'Pet lover'],
        education: ['Masters Degree', 'MBA'],
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer.mock@soulmate.ai',
        phone: '+919876543212',
        gender: 'female',
        dob: '1998-03-08',
        city: 'Mumbai',
        state: 'Maharashtra',
        bio: 'Classical musician and educator. Love yoga, organic cooking, and spending peaceful weekends at home. Seeking a spiritual and kind partner.',
        values: ['Family values', 'Spiritual growth', 'Mutual respect'],
        lifestyle: ['Vegetarian', 'Teetotaler', 'Fitness enthusiast'],
        education: ['Masters Degree'],
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
      },
      {
        name: 'Kabir Malhotra',
        email: 'kabir.malhotra.mock@soulmate.ai',
        phone: '+919876543213',
        gender: 'male',
        dob: '1995-11-30',
        city: 'Mumbai',
        state: 'Maharashtra',
        bio: 'Chartered Accountant who loves playing cricket and photography. Looking for a partner to build a warm, supportive home, balancing career aspirations and family values.',
        values: ['Family values', 'Career orientation', 'Financial stability'],
        lifestyle: ['Non-vegetarian', 'Teetotaler', 'Night owl'],
        education: ['Bachelors Degree', 'CA'],
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
      }
    ];

    for (const p of mockProfiles) {
      const user = new UserModel({
        name: p.name,
        email: p.email,
        phoneNumber: p.phone,
        isVerified: true
      });
      await user.save();

      const profile = new ProfileModel({
        userId: user._id,
        gender: p.gender,
        dateOfBirth: new Date(p.dob),
        location: { city: p.city, state: p.state },
        bio: p.bio,
        photos: [p.photo],
        trustBadges: { idVerified: true, videoVerified: true, familyVerified: false },
        aiPreferences: {
          rawTranscript: 'Seeded default search preferences',
          structuredPrefs: {
            ageMin: 21,
            ageMax: 35,
            values: p.values,
            lifestyle: p.lifestyle,
            locationPrefs: [p.city],
            education: p.education
          }
        }
      });
      await profile.save();
    }
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

// Initialize DB and start server
connectDB().then(() => {
  seedDatabase();
  initSockets(io);
  
  server.listen(PORT, () => {
    console.log(`SoulMate AI Backend API running on port ${PORT}`);
  });
});
