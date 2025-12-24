#!/usr/bin/env node
// CommonJS script to test MongoDB connection (use .cjs because server package.json sets type=module)
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const argvUri = process.argv[2];
const uri = argvUri || process.env.MONGODB_URI;

async function main() {
  if (!uri) {
    console.error('No MongoDB URI provided. Set MONGODB_URI in server/.env or pass as first arg.');
    process.exit(1);
  }

  console.log('Testing MongoDB connection...');
  try {
    const redacted = uri.replace(/(mongodb\+srv:\/\/[^:]+:)(.+)@/, '$1<REDACTED>@');
    console.log('URI (redacted):', redacted);
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to MongoDB successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('✗ MongoDB connection failed:');
    console.error(err && err.message ? err.message : err);
    process.exit(2);
  }
}

main();
