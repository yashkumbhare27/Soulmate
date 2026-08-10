import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soulmate-ai';
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully to:', mongoURI.includes('@') ? 'Atlas' : mongoURI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
