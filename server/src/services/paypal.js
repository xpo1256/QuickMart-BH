import * as paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

function getClient() {
  const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase();
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('PayPal credentials not provided');

  const environment = mode === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
}

// Create PayPal order and return the approval link + order id
export async function processPayPalPayment(orderId, amount, email) {
  const client = getClient();

  const conversionRate = parseFloat(process.env.PAYPAL_BHD_TO_USD_RATE) || 2.65957;
  const targetCurrency = process.env.PAYPAL_CURRENCY || 'USD';
  const convertedAmount = Number((amount * conversionRate).toFixed(2));

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: targetCurrency,
          value: String(convertedAmount),
        },
        description: `Order #${orderId} (original: ${Number(amount).toFixed(3)} BHD)`,
        custom_id: String(orderId),
      },
    ],
    application_context: {
      brand_name: 'QuickMart-BH',
      return_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?orderId=${orderId}`,
      user_action: 'PAY_NOW',
    },
  });

  try {
    const response = await client.execute(request);
    const result = response.result;
    const approval = (result.links || []).find(l => l.rel === 'approve');
    return { order: result, approvalLink: approval ? approval.href : null };
  } catch (err) {
    console.error('PayPal create order error:', err);
    throw err;
  }
}

// Capture PayPal order (pass the PayPal order ID token)
export async function verifyPayPalPayment(paypalOrderId) {
  const client = getClient();
  const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
  request.requestBody({});
  try {
    const response = await client.execute(request);
    return response.result;
  } catch (err) {
    console.error('PayPal capture error:', err);
    throw err;
  }
}
