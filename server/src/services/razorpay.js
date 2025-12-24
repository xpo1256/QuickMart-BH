import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function createRazorpayOrder(orderId, amountBHD) {
  // convert BHD to smallest currency unit for INR or to USD cents depending on currency
  // Razorpay uses INR by default; assume using INR or use smallest unit for target currency
  // We'll use amount in BHD -> convert to currency configured by env RAZORPAY_CURRENCY (default INR)
  const currency = process.env.RAZORPAY_CURRENCY || 'INR';
  // conversion rate env optional
  const rate = parseFloat(process.env.RAZORPAY_BHD_TO_TARGET_RATE) || 2.65957;
  const amountTarget = Math.round(Number(amountBHD) * rate * 100); // in paise/cents

  const options = {
    amount: amountTarget,
    currency,
    receipt: `order_${orderId}`,
    payment_capture: 1,
  };

  const order = await razor.orders.create(options);
  return order;
}

export function verifyRazorpaySignature(body) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
  const generated = crypto.createHmac('sha256', key_secret).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
  return generated === razorpay_signature;
}
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay payment order
export async function processRazorpayPayment(orderId, amount, customerName, customerEmail, customerPhone) {
  try {
    const amountInSmallestUnit = Math.round(amount * 100); // Razorpay uses paise (1 BHD = 100 paise)

    const orderOptions = {
      amount: amountInSmallestUnit,
      currency: 'BHD',
      receipt: orderId,
      notes: {
        customerName,
        customerEmail,
        customerPhone,
        orderDescription: `Order #${orderId}`,
      },
    };

    const order = await razorpay.orders.create(orderOptions);
    return order;
  } catch (error) {
    console.error('Razorpay payment creation error:', error);
    throw error;
  }
}

// Verify Razorpay payment
export async function verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  try {
    const signatureData = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureData)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpaySignature;

    if (isSignatureValid) {
      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      return {
        valid: true,
        payment,
      };
    }

    return {
      valid: false,
      error: 'Invalid signature',
    };
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    throw error;
  }
}

// Get payment status
export async function getRazorpayPaymentStatus(paymentId) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
}
