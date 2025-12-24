import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('✗ FATAL: MONGODB_URI is not defined in environment variables!');
    if (process.env.NODE_ENV === 'production') process.exit(1);
    return;
  }

  try {
    // Enforce TLS for production. Prefer mongodb+srv (Atlas) which uses TLS by default.
    if (process.env.NODE_ENV === 'production') {
      if (!/^mongodb\+srv:\/\//.test(mongoUri) && !/([?&](tls|ssl)=true)/i.test(mongoUri)) {
        console.error('✗ FATAL: In production, MONGODB_URI must use mongodb+srv:// or include tls=true');
        process.exit(1);
      }
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: process.env.NODE_ENV === 'production' ? true : undefined,
    });

    isConnected = true;
    console.log('✓ MongoDB connected successfully to Atlas');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    // In production, we want the server to stop so Render shows a "Failed" status
    if (process.env.NODE_ENV === 'production') {
       process.exit(1); 
    }
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}