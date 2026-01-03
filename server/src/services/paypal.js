// ============================================
// ADD THIS AFTER YOUR IMPORTS (around line 13)
// ============================================
import paypal from '@paypal/checkout-server-sdk';

// ============================================
// PAYPAL CONFIGURATION (Add after adminGuard)
// ============================================

// Initialize PayPal client
let paypalClient;
try {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    console.error('⚠️  PayPal credentials missing - PayPal payments will not work');
  } else {
    const environment = mode === 'live' || mode === 'production'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    
    paypalClient = new paypal.core.PayPalHttpClient(environment);
    console.log(`✓ PayPal initialized in ${mode} mode`);
  }
} catch (error) {
  console.error('✗ PayPal initialization failed:', error.message);
}

// Currency conversion helper
const convertBHDToUSD = (amountBHD) => {
  const rate = parseFloat(process.env.PAYPAL_BHD_TO_USD_RATE || '2.65957');
  return (amountBHD / rate).toFixed(2);
};

// ============================================
// PAYPAL ROUTES (Add before your existing /api/orders routes)
// ============================================

// Create PayPal Order
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(503).json({ 
        error: 'PayPal not configured',
        message: 'PayPal credentials are missing from server configuration'
      });
    }

    const { items, totalPrice, currency = 'BHD' } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid order data',
        message: 'Items array is required and must not be empty' 
      });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ 
        error: 'Invalid total price',
        message: 'Total price must be greater than 0' 
      });
    }

    // Convert BHD to USD for PayPal
    const amountUSD = currency === 'BHD' 
      ? convertBHDToUSD(totalPrice) 
      : totalPrice.toFixed(2);

    console.log(`[PayPal] Creating order: ${currency} ${totalPrice} → USD ${amountUSD}`);

    // Create PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    
    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'QuickMart Bahrain',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/checkout/success`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`
      },
      purchase_units: [{
        reference_id: `ORDER_${Date.now()}`,
        description: 'QuickMart Order',
        custom_id: JSON.stringify({ 
          currency, 
          originalAmount: totalPrice,
          itemCount: items.length 
        }),
        amount: {
          currency_code: 'USD',
          value: amountUSD,
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: amountUSD
            }
          }
        },
        items: items.slice(0, 20).map((item, idx) => ({ // PayPal limits to 20 items
          name: (item.name || 'Product').substring(0, 127),
          description: (item.description || '').substring(0, 127),
          unit_amount: {
            currency_code: 'USD',
            value: currency === 'BHD' 
              ? convertBHDToUSD(item.price || 0)
              : (item.price || 0).toFixed(2)
          },
          quantity: (item.quantity || 1).toString()
        }))
      }]
    });

    // Execute request
    const response = await paypalClient.execute(request);
    
    console.log('[PayPal] Order created:', response.result.id);

    res.json({
      success: true,
      id: response.result.id,
      status: response.result.status,
      links: response.result.links
    });

  } catch (error) {
    console.error('[PayPal] Order creation failed:', error);
    
    // Handle specific PayPal errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: 'PayPal API Error',
        message: error.message,
        details: error.details || []
      });
    }

    res.status(500).json({
      error: 'Failed to create PayPal order',
      message: error.message
    });
  }
});

// Capture PayPal Payment
app.post('/api/paypal/capture-order/:orderID', async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(503).json({ error: 'PayPal not configured' });
    }

    const { orderID } = req.params;
    const { orderData } = req.body;

    console.log(`[PayPal] Capturing payment for order ${orderID}`);

    // Capture the payment
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    
    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({
        error: 'Payment not completed',
        status: capture.result.status
      });
    }

    console.log('[PayPal] Payment captured successfully');

    // Save order to database if orderData provided
    let savedOrder = null;
    if (orderData) {
      try {
        const newOrder = new Order({
          id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: orderData.userId || 'guest',
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          customerAddress: orderData.customerAddress,
          items: orderData.items,
          totalPrice: orderData.totalPrice,
          paymentMethod: 'paypal',
          paymentStatus: 'completed',
          orderStatus: 'confirmed',
          paymentId: capture.result.id,
          paymentProvider: 'paypal',
          notes: orderData.notes
        });

        savedOrder = await newOrder.save();
        console.log('[Order] Saved to database:', savedOrder.id);
      } catch (dbError) {
        console.error('[Order] Database save failed:', dbError);
        // Don't fail the capture if DB save fails - payment already went through
      }
    }

    res.json({
      success: true,
      orderID: capture.result.id,
      status: capture.result.status,
      payer: capture.result.payer,
      savedOrder: savedOrder ? {
        id: savedOrder.id,
        orderStatus: savedOrder.orderStatus
      } : null
    });

  } catch (error) {
    console.error('[PayPal] Capture failed:', error);
    
    res.status(500).json({
      error: 'Failed to capture payment',
      message: error.message
    });
  }
});

// Get PayPal Order Details
app.get('/api/paypal/orders/:orderID', async (req, res) => {
  try {
    if (!paypalClient) {
      return res.status(503).json({ error: 'PayPal not configured' });
    }

    const { orderID } = req.params;

    const request = new paypal.orders.OrdersGetRequest(orderID);
    const response = await paypalClient.execute(request);

    res.json(response.result);

  } catch (error) {
    console.error('[PayPal] Get order failed:', error);
    
    res.status(500).json({
      error: 'Failed to get order details',
      message: error.message
    });
  }
});
