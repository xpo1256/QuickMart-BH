#!/usr/bin/env node
import fs from 'fs';
import crypto from 'crypto';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load env from server/.env if present
dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

function usage() {
  console.log('Usage: node send_tap_webhook.js --orderId=<ORDER_ID> [--url=http://localhost:5000/api/payments/tap/webhook]');
}

const args = process.argv.slice(2);
const opts = {};
for (const a of args) {
  const [k, v] = a.split('=');
  if (k && v) opts[k.replace(/^--/, '')] = v;
}

if (!opts.orderId) {
  usage();
  process.exit(1);
}

const webhookUrl = opts.url || 'http://localhost:5000/api/payments/tap/webhook';
const secret = process.env.TAP_SECRET_KEY || '';

if (!secret) {
  console.error('TAP_SECRET_KEY not found in environment. Please set TAP_SECRET_KEY in server/.env or env.');
  process.exit(2);
}

// Build a sample payload similar to what Tap would send
const payload = {
  event: 'payment.captured',
  data: {
    object: {
      id: `pay_${Math.random().toString(36).slice(2, 10)}`,
      merchant_order_id: String(opts.orderId),
      amount: 100,
      currency: 'BHD',
      status: 'captured',
    }
  }
};

const raw = JSON.stringify(payload);

const hmac = crypto.createHmac('sha256', secret).update(raw).digest('hex');

async function send() {
  console.log('Sending webhook to', webhookUrl);
  console.log('Payload:', raw);
  console.log('Signature (tap-signature):', hmac.slice(0, 8) + '...');

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'tap-signature': hmac,
      },
      body: raw,
    });

    const text = await res.text().catch(() => '');
    console.log('Response status:', res.status);
    console.log('Response body:', text);
  } catch (err) {
    console.error('Error sending webhook:', err && (err.message || err));
  }
}

send();
