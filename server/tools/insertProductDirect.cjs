#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.argv[2] || process.env.MONGODB_URI;
const productFile = process.argv[3] || path.join(__dirname, 'sample_product.json');

if (!uri) {
  console.error('No MONGODB_URI provided. Set it in server/.env or pass as first arg.');
  process.exit(1);
}

async function main() {
  try {
    const raw = fs.readFileSync(productFile, 'utf-8');
    const product = JSON.parse(raw);

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const coll = mongoose.connection.collection('products');
    const res = await coll.insertOne(product);
    console.log('Inserted product _id:', res.insertedId.toString());
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error inserting product:', err && err.message ? err.message : err);
    process.exit(2);
  }
}

main();
