import dotenv from 'dotenv';
dotenv.config();

// Helper to get Access Token (Required for Live)
async function getPayPalAccessToken() {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const url = process.env.PAYPAL_MODE === 'live' 
        ? 'https://api-m.paypal.com/v1/oauth2/token' 
        : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

    const response = await fetch(url, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get PayPal token: ${errorData}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function processPayPalPayment(orderId, amount) {
    try {
        const accessToken = await getPayPalAccessToken();
        const baseUrl = process.env.PAYPAL_MODE === 'live' 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';

        const conversionRate = parseFloat(process.env.PAYPAL_BHD_TO_USD_RATE) || 2.65957;
        const convertedAmount = (amount * conversionRate).toFixed(2);

        const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: String(orderId),
                    amount: {
                        currency_code: 'USD',
                        value: convertedAmount
                    },
                    description: `Order #${orderId}`
                }],
                application_context: {
                    brand_name: 'QuickMart-BH',
                    landing_page: 'NO_PREFERENCE',
                    user_action: 'PAY_NOW',
                    return_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`,
                    cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?orderId=${orderId}`
                }
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("PayPal API Error Detail:", JSON.stringify(result, null, 2));
            throw new Error(result.message || 'Failed to create PayPal order');
        }

        const approvalLink = result.links.find(link => link.rel === 'approve').href;
        return { order: result, approvalLink };

    } catch (err) {
        console.error('Process Payment Error:', err.message);
        throw err;
    }
}

export async function verifyPayPalPayment(paypalOrderId) {
    const accessToken = await getPayPalAccessToken();
    const baseUrl = process.env.PAYPAL_MODE === 'live' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        }
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to capture payment');
    return result;
}