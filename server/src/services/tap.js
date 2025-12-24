import dotenv from 'dotenv';

dotenv.config();

// If TAP_SECRET_KEY isn't present, attempt to load .env from common locations
try {
  if (!process.env.TAP_SECRET_KEY) {
    const path = require('path');
    const tryPaths = [
      path.resolve(process.cwd(), 'server', '.env'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '..', 'server', '.env')
    ];
    for (const p of tryPaths) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const d = require('dotenv');
        const res = d.config({ path: p });
        if (res && res.parsed) {
          console.info(`Tap service: loaded env from ${p}`);
        }
        if (process.env.TAP_SECRET_KEY) break;
      } catch (e) {
        // ignore path load errors
      }
    }
  }

  const has = !!process.env.TAP_SECRET_KEY;
  console.info('Tap service: TAP_SECRET_KEY present=', has);
} catch (e) {
  console.error('Tap service env detection error', e && (e.message || e));
}

// Tap Payments integration using server-side secret key.
// Required env variables:
//   TAP_SECRET_KEY - your Tap secret API key (sandbox or live)
//   TAP_PUBLIC_KEY - optional public key for client-side usage
//   FRONTEND_URL - your frontend URL (used as default return/cancel)

const TAP_API_BASE = process.env.TAP_API_BASE || 'https://api.tap.company/v2';

export async function createTapPayment(orderId, amountBHD, customer = {}) {
  // Dev override: force mock hosted checkout even if TAP_SECRET_KEY is set
  if (String(process.env.FORCE_TAP_MOCK || '') === '1') {
    console.warn('Tap service: FORCE_TAP_MOCK=1 — returning mock payment URL for development.');
    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?orderId=${orderId}&mock=1`;
    return { paymentUrl: returnUrl, mock: true };
  }

  if (!process.env.TAP_SECRET_KEY) {
    // Development fallback: return a mock hosted payment URL that redirects to frontend success page.
    // This allows developers to test the checkout flow locally without real Tap credentials.
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      console.warn('Tap service: TAP_SECRET_KEY not configured — returning mock payment URL for development.');
      const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?orderId=${orderId}&mock=1`;
      return { paymentUrl: returnUrl, mock: true };
    }
    throw new Error('TAP_SECRET_KEY not configured. Please set TAP_SECRET_KEY in server/.env to enable Tap Payments.');
  }

  // Build request payload according to Tap Checkout Session API.
  // We keep payload minimal: amount, currency, customer (email), products, and return_urls.
  const currency = process.env.TAP_CURRENCY || 'BHD';
  const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?orderId=${orderId}`;
  const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/payment-cancel?orderId=${orderId}`;
  // Tap expects amount in the smallest currency unit. For most currencies multiply by 100,
  // but for Bahraini Dinar (BHD) the smallest unit is 1/1000 (fils), so multiply by 1000.
  const multiplier = currency === 'BHD' ? 1000 : 100;
  const body = {
    amount: Math.round(Number(amountBHD || 0) * multiplier),
    currency,
    // merchant_order_id is useful to map back
    merchant_order_id: String(orderId),
    customer: {
      email: customer.email || undefined,
    },
    return_url: returnUrl,
    cancel_url: cancelUrl,
    // minimal product info (frontend can show) - optional
    products: [{ name: `Order ${orderId}`, unit_amount: Math.round(Number(amountBHD || 0) * multiplier), quantity: 1 }],
  };

  const url = `${TAP_API_BASE}/checkout/session`;
  try {
    console.info('Tap API request:', { url, payload: body });
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TAP_SECRET_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text().catch(() => null);
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    // Log headers and request id if provided by Tap for support debugging
    try {
      const rid = res.headers && (res.headers.get ? res.headers.get('x-request-id') : undefined);
      console.info('Tap API response status:', res.status, 'request-id:', rid, 'headers:', res.headers && res.headers.raw ? res.headers.raw() : 'n/a', 'body:', data);
    } catch (e) {
      console.info('Tap API response status:', res.status, 'body:', data);
    }
    if (!res.ok) {
      const errMsg = (data && (data.message || JSON.stringify(data))) || `HTTP ${res.status}`;
      throw new Error(`Tap API error: ${errMsg}`);
    }

    // Attempt to locate a checkout URL in the response (Tap may return different shapes)
    const paymentUrl = data?.data?.url || data?.checkout_url || data?.payment_url || data?.redirect_url || data?.url || (data && data.data && data.data.checkout && data.data.checkout.url) || null;

    if (!paymentUrl) {
      // Return entire payload so caller can examine
      return { paymentUrl: null, raw: data };
    }

    return { paymentUrl };
  } catch (err) {
    console.error('createTapPayment error:', err && (err.message || err));
    throw err;
  }
}

export function verifyTapSignatureRaw(rawBodyBuffer, signatureHeader) {
  // Tap signs webhook payloads using HMAC SHA256 with your secret key.
  // The header used by Tap can be 'tap-signature' (lowercase) or 'Tap-Signature'.
  if (!process.env.TAP_SECRET_KEY) {
    throw new Error('TAP_SECRET_KEY not configured');
  }
  const key = process.env.TAP_SECRET_KEY;
  try {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', key).update(rawBodyBuffer).digest('hex');
    if (!signatureHeader) return false;
    // signatureHeader may include multiple signatures; compare hex values
    const header = String(signatureHeader || '');
    // simple contains check
    return header.indexOf(hmac) !== -1 || header === hmac;
  } catch (err) {
    console.error('verifyTapSignatureRaw error', err);
    return false;
  }
}
