import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Testing MongoDB connection using MONGODB_URI from .env');
if (!uri) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(2);
}

(async () => {
  try {
    console.log('Attempting to connect to:', uri.replace(/(:\/\/.*@)/, '://****@'));
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to MongoDB successfully');
    const conn = mongoose.connection;
    try {
      console.log('  host:', conn.host || conn.client?.s?.url || 'unknown');
      console.log('  db:', conn.name || conn.client?.s?.options?.dbName || 'unknown');
    } catch (e) { /* ignore */ }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('✗ MongoDB connect error:');
    try {
      console.error(err && err.stack ? err.stack : err);
    } catch (e) {
      console.error(String(err));
    }
    process.exit(1);
  }
})();
