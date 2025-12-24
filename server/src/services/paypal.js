import paypal from 'paypal-rest-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// Create a small web experience profile to set brand name shown on PayPal pages
const createWebProfile = () => new Promise((resolve, reject) => {
  const profile = {
    name: `QuickMartWebProfile-${Date.now()}`,
    presentation: { brand_name: 'QuickMart-BH', locale_code: 'en_US' },
    input_fields: { no_shipping: 0, address_override: 0 }
  };
  paypal.webProfile.create(profile, (err, res) => {
    if (err) return reject(err);
    try {
      // res.id should be the profile id
      resolve(res && res.id ? res.id : null);
    } catch (e) {
      resolve(null);
    }
  });
});

// Create PayPal payment
export async function processPayPalPayment(orderId, amount, email) {
  return new Promise((resolve, reject) => {
    // Convert BHD -> USD for PayPal if configured (default rate approximates 1 BHD = 2.65957 USD)
    const conversionRate = parseFloat(process.env.PAYPAL_BHD_TO_USD_RATE) || 2.65957;
    const targetCurrency = process.env.PAYPAL_CURRENCY || 'USD';
    const convertedAmount = Number((amount * conversionRate).toFixed(2));

    const payment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
        payer_info: {
          email,
        },
      },
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?orderId=${orderId}`,
      },
      transactions: [
        {
          amount: {
            // amount passed into this function is expected in BHD (local currency)
            // PayPal requires a supported currency (USD by default), so we convert.
            total: convertedAmount.toFixed ? convertedAmount.toFixed(2) : String(convertedAmount),
            currency: targetCurrency,
          },
          description: `Order #${orderId} (original: ${amount.toFixed(3)} BHD -> ${convertedAmount.toFixed(2)} ${targetCurrency})`,
          custom: JSON.stringify({ originalCurrency: 'BHD', originalAmount: amount }),
        },
      ],
    };

    // Debug info: indicate mode and masked client id (do not print full secret)
    try {
      const maskedClient = (process.env.PAYPAL_CLIENT_ID || '').slice(0, 8) + '...';
      console.debug('PayPal: mode=', process.env.PAYPAL_MODE, 'client_id=', maskedClient, 'currency=', process.env.PAYPAL_CURRENCY || 'USD');
    } catch (e) {
      // ignore
    }

    // Attempt to create a web profile to show a custom brand name in the PayPal flow.
    createWebProfile().then(profileId => {
      if (profileId) payment.experience_profile_id = profileId;
      paypal.payment.create(payment, (err, createdPayment) => {
        if (err) {
          // Provide richer logging for troubleshooting
          try {
            if (err.response) {
              console.error('PayPal create error response:', JSON.stringify(err.response, null, 2));
            } else {
              console.error('PayPal create error:', err);
            }
          } catch (logErr) {
            console.error('PayPal create error (fallback):', err, logErr);
          }
          return reject(err);
        }

        try {
          console.debug('PayPal create success, id=', createdPayment && createdPayment.id);
          if (createdPayment && createdPayment.links) {
            const approval = createdPayment.links.find(l => l.rel === 'approval_url');
            if (approval) console.debug('PayPal approval link:', approval.href);
          }
        } catch (logErr) {
          console.error('PayPal logging error:', logErr);
        }

        resolve(createdPayment);
      });
    }).catch(profileErr => {
      // If profile creation failed, still proceed with payment creation but log the issue
      console.warn('Failed to create PayPal web profile:', profileErr);
      paypal.payment.create(payment, (err, createdPayment) => {
        if (err) {
          try {
            if (err.response) {
              console.error('PayPal create error response:', JSON.stringify(err.response, null, 2));
            } else {
              console.error('PayPal create error:', err);
            }
          } catch (logErr) {
            console.error('PayPal create error (fallback):', err, logErr);
          }
          return reject(err);
        }
        try {
          console.debug('PayPal create success, id=', createdPayment && createdPayment.id);
          if (createdPayment && createdPayment.links) {
            const approval = createdPayment.links.find(l => l.rel === 'approval_url');
            if (approval) console.debug('PayPal approval link:', approval.href);
          }
        } catch (logErr) {
          console.error('PayPal logging error:', logErr);
        }
        resolve(createdPayment);
      });
    });
  });
}

// Verify PayPal payment
export async function verifyPayPalPayment(paymentId, payerId) {
  return new Promise((resolve, reject) => {
    paypal.payment.execute(paymentId, { payer_id: payerId }, (err, payment) => {
      if (err) {
        reject(err);
      } else {
        resolve(payment);
      }
    });
  });
}
