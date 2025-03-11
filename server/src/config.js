import 'dotenv/config';
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('MongoDB Atlas connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;