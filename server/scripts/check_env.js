// Simple environment checker for production
require('dotenv').config();
const required = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'ADMIN_API_KEY',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
];
let ok = true;
if (process.env.NODE_ENV === 'production') {
  required.forEach((k) => {
    if (!process.env[k]) {
      console.error(`Missing required env: ${k}`);
      ok = false;
    }
  });
}
if (!ok) process.exit(2);
console.log('Env check passed');
