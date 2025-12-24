import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: './.env' });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}, { projection: { email: 1, name: 1 } }).limit(50).toArray();
    const products = await db.collection('products').find({}, { projection: { name: 1 } }).limit(50).toArray();
    console.log('Users (up to 50):', users);
    console.log('Products (up to 50):', products);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Inspect DB error', err);
    process.exit(2);
  }
}

run();
