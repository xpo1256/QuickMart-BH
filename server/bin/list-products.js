import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(2);
}

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB. Querying products...');
    const count = await Product.countDocuments().catch(()=>0);
    console.log('Products count =', count);
    const docs = await Product.find().sort({ createdAt: -1 }).limit(10).lean();
    console.log('Sample products:', JSON.stringify(docs, null, 2));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error listing products:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
