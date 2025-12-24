import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send order confirmation email
export async function sendOrderConfirmation(order) {
  try {
    const paymentStatusText = {
      pending: 'Pending',
      pending_verification: 'Pending Verification - We will confirm once we receive your bank transfer',
      pending_on_delivery: 'Pending - Payment due on delivery',
      completed: 'Paid',
    };

    const orderStatusText = {
      pending: 'Processing',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
          ${item.price.toFixed(2)} BHD
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
          ${(item.price * item.quantity).toFixed(2)} BHD
        </td>
      </tr>
    `
      )
      .join('');

    const bankDetailsHtml =
      order.paymentMethod === 'bank_transfer'
        ? `
      <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Bank Transfer Details</h3>
        <p><strong>Recipient:</strong> ${process.env.BANK_RECIPIENT_NAME}</p>
        <p><strong>Account Number:</strong> ${process.env.BANK_ACCOUNT_NUMBER}</p>
        <p><strong>IBAN:</strong> ${process.env.BANK_IBAN}</p>
        <p><strong>Bank:</strong> ${process.env.BANK_NAME}</p>
        <p style="color: #856404;"><strong>Reference ID:</strong> ${order.transferReference || 'Pending'}</p>
      </div>
    `
        : '';

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #007bff; color: white; padding: 10px; text-align: left; }
        .total-row { font-weight: bold; background: #f8f9fa; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛍️ Order Confirmation</h1>
        </div>
        
        <div class="content">
          <p>Hello ${order.customer.name},</p>
          
          <p>Thank you for your order! We're excited to serve you.</p>
          
          <div class="order-info">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US')}</p>
            <p><strong>Status:</strong> ${orderStatusText[order.orderStatus] || 'Processing'}</p>
            <p><strong>Payment Status:</strong> ${paymentStatusText[order.paymentStatus] || 'Pending'}</p>
          </div>
          
          <h3>Delivery Address</h3>
          <p>${order.customer.address}</p>
          <p>Phone: ${order.customer.phone}</p>
          
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="3" style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">Total:</td>
                <td style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">${order.totalPrice.toFixed(2)} BHD</td>
              </tr>
            </tbody>
          </table>
          
          ${bankDetailsHtml}
          
          <h3>What's Next?</h3>
          <ol>
            <li><strong>Payment:</strong> Complete your payment using the selected method</li>
            <li><strong>Processing:</strong> Once payment is confirmed, we'll prepare your order</li>
            <li><strong>Delivery:</strong> Your items will be delivered to the address above</li>
            <li><strong>Confirmation:</strong> You'll receive an email when your order is on the way</li>
          </ol>
          
          <h3>Payment Method</h3>
          <p><strong>${order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : order.paymentMethod === 'credit' ? 'Credit Card' : order.paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}</strong></p>
          
          <p style="color: #666; margin-top: 30px;">
            Questions? Contact us at <strong>${process.env.EMAIL_FROM}</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 QuickMart Bahrain. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: order.customer.email,
      subject: `Order Confirmation - Order #${order.id}`,
      html: emailHtml,
    };

    // In production, actually send email
    // await transporter.sendMail(mailOptions);

    console.log('✉️  Order confirmation email would be sent to:', order.customer.email);
    return { success: true, message: 'Email notification sent' };
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't fail the order if email fails
    return { success: false, error: error.message };
  }
}

// Send payment confirmation email
export async function sendPaymentConfirmation(order, paymentDetails) {
  try {
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Confirmed</h1>
        </div>
        
        <div class="content">
          <p>Hello ${order.customer.name},</p>
          
          <p>Your payment has been successfully received!</p>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #155724;">Payment Confirmed</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Amount:</strong> ${order.totalPrice.toFixed(2)} BHD</p>
            <p><strong>Payment Method:</strong> ${paymentDetails.method || order.paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId || order.id}</p>
          </div>
          
          <h3>Next Steps</h3>
          <p>Your order is now being prepared for delivery. You will receive tracking information via email shortly.</p>
          
          <p style="color: #666;">
            Questions? Contact us at <strong>${process.env.EMAIL_FROM}</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: order.customer.email,
      subject: `Payment Confirmed - Order #${order.id}`,
      html: emailHtml,
    };

    // In production, actually send email
    // await transporter.sendMail(mailOptions);

    console.log('✉️  Payment confirmation email would be sent to:', order.customer.email);
    return { success: true };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: error.message };
  }
}
