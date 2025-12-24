#!/usr/bin/env node
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function gen(len = 32) {
  return crypto.randomBytes(len).toString('base64').replace(/\+/g,'A').replace(/\//g,'B').replace(/=+$/,'');
}

const secrets = {
  MONGODB_PASSWORD: gen(24),
  JWT_SECRET: gen(48),
  ADMIN_API_KEY: gen(32),
  PAYPAL_CLIENT_SECRET: gen(32),
  TAP_SECRET_KEY: gen(32),
  EMAIL_PASSWORD: gen(24),
  AWS_SECRET_ACCESS_KEY: gen(32),
};

const envLines = [];
envLines.push('# GENERATED .env.rotate — do NOT commit. Use these values to update Render env vars.');
envLines.push('');
envLines.push(`JWT_SECRET=${secrets.JWT_SECRET}`);
envLines.push(`ADMIN_API_KEY=${secrets.ADMIN_API_KEY}`);
envLines.push(`EMAIL_PASSWORD=${secrets.EMAIL_PASSWORD}`);
envLines.push(`PAYPAL_CLIENT_SECRET=${secrets.PAYPAL_CLIENT_SECRET}`);
envLines.push(`TAP_SECRET_KEY=${secrets.TAP_SECRET_KEY}`);
envLines.push(`AWS_SECRET_ACCESS_KEY=${secrets.AWS_SECRET_ACCESS_KEY}`);
envLines.push(`MONGODB_PASSWORD=${secrets.MONGODB_PASSWORD}`);

const serverEnvPath = path.join(__dirname, '..', 'server', '.env.rotate');
fs.writeFileSync(serverEnvPath, envLines.join('\n'));

console.log('Generated secrets and wrote server/.env.rotate (ignored by .gitignore).');
console.log('Paste the following values into your providers and Render env settings:');
console.log('---');
Object.keys(secrets).forEach(k => console.log(k + ': ' + secrets[k]));
console.log('---');
console.log('Next steps:');
console.log('1) Rotate credentials in MongoDB Atlas / PayPal / TAP / Email provider using their consoles.');
console.log('   Use the generated values above where appropriate (e.g., set new DB user password to MONGODB_PASSWORD).');
console.log('2) Update Render service environment variables manually, or run tools/set_render_env.sh with your Render API key and service id.');
console.log('\nTo run: node tools/generate_secrets.js');
