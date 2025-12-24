# MongoDB Migration Setup Guide

## ✅ Completed: Database Migration to MongoDB

Your e-commerce backend has been successfully migrated from file-based storage to **MongoDB**. This provides better scalability, querying, and data management.

## 📋 What Changed

### Removed
- ❌ File-based JSON storage in `server/data/orders/`
- ❌ Synchronous file I/O operations
- ❌ Razorpay payment gateway (not available in Bahrain)

### Added
- ✅ **MongoDB database** for persistent order storage
- ✅ **Mongoose ODM** for data modeling and validation
- ✅ Async/await patterns throughout backend
- ✅ Database connection management
- ✅ Order schemas with proper indexing

## 🚀 Setup Instructions

### Step 1: Create MongoDB Account
1. Go to [MongoDB Cloud](https://cloud.mongodb.com)
2. Sign up for a free account (M0 tier included)
3. Create a new project
4. Create a cluster (select Bahrain region if available, or closest region)

### Step 2: Get Connection String
1. In MongoDB Cloud, click "Connect" on your cluster
2. Select "Drivers" → "Node.js"
3. Copy the connection string that looks like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/quickmart-bahrain?retryWrites=true&w=majority
   ```

### Step 3: Update Environment Variables

#### Backend (.env in server folder)
Replace the commented MongoDB URI with your actual connection string:
```env
# Database (MongoDB)
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/quickmart-bahrain?retryWrites=true&w=majority
```

### Step 4: Install Dependencies

Open terminal in the `server` folder and run:
```bash
npm install mongoose
```

This installs the MongoDB driver that's already in package.json.

### Step 5: Start the Server

```bash
npm start
```

You should see:
```
✓ MongoDB connected successfully
✓ QuickMart Backend Server running on http://localhost:5000
✓ MongoDB connected and ready
```

## 📊 Database Schema

### Order Collection
Each order document contains:

```javascript
{
  id: "ABC12345",                    // Order ID (unique)
  userId: "guest",                   // User identifier
  customerName: "Ahmed Al-Khalifa",  // Customer name
  customerEmail: "ahmed@example.com",// Email
  customerPhone: "+973-1234-5678",   // Phone
  customerAddress: {                 // Delivery address
    street: "123 Main Street",
    city: "Manama",
    postalCode: "428",
    country: "Bahrain"
  },
  items: [                           // Order items array
    {
      id: "PROD-001",
      name: "Wireless Headphones",
      price: 89.99,
      quantity: 1,
      image: "image-url"
    }
  ],
  totalPrice: 89.99,                 // Total amount (BHD)
  paymentMethod: "paypal",           // 'paypal', 'bank', or 'cash'
  paymentStatus: "completed",        // Payment status
  orderStatus: "confirmed",          // Order status
  paymentId: "PAY-123456",           // Payment provider ID
  bankTransferReference: "TRF123",   // Bank transfer reference (if applicable)
  createdAt: "2025-12-20T...",       // Created timestamp
  updatedAt: "2025-12-20T..."        // Updated timestamp
}
```

## 🔍 Queries & Indexes

The database has automatic indexes for:
- **By User & Date**: Fast customer order history
- **By Email**: Quick customer lookup
- **By Payment Status**: Admin reports and tracking

Example queries (already implemented in backend):
- Find all orders: `/api/admin/orders`
- Find single order: `/api/orders/:orderId`
- Payment verification endpoints

## 🔐 Security Best Practices

1. **Never commit credentials** - Keep .env files in .gitignore
2. **Use strong passwords** - MongoDB auto-generates strong passwords
3. **IP Whitelist** - In MongoDB Cloud, add your server IP to whitelist
4. **Environment Variables** - Always use .env for sensitive data

## 📝 Payment Methods (Fully Integrated)

✅ **Cash on Delivery**
- No setup needed
- Payment collected at delivery
- Endpoint: `/api/payments/cash-on-delivery/confirm`

✅ **Bank Transfer**
- Configure bank details in `.env`
- Customer provides transfer reference
- Endpoint: `/api/payments/bank-transfer/confirm`

✅ **PayPal**
- Add PayPal credentials to `.env` when ready
- Endpoint: `/api/payments/paypal/create` and `/api/payments/paypal/verify`

❌ **Razorpay** - Removed (not available in Bahrain)

## 🧪 Testing the Setup

### Test 1: Check MongoDB Connection
```bash
# Server should show "✓ MongoDB connected successfully"
npm start
```

### Test 2: Create Order
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Ahmed",
    "customerEmail": "ahmed@example.com",
    "customerPhone": "+973-1234-5678",
    "deliveryAddress": {
      "street": "123 Street",
      "city": "Manama",
      "postalCode": "428",
      "country": "Bahrain"
    },
    "items": [{
      "id": "PROD-001",
      "name": "Product",
      "price": 50,
      "quantity": 1
    }],
    "totalPrice": 50,
    "paymentMethod": "cash"
  }'
```

### Test 3: Retrieve Order
```bash
curl http://localhost:5000/api/orders/ABC12345
```

## 🐛 Troubleshooting

### "MONGODB_URI not defined"
- Check `.env` file exists in server folder
- Verify `MONGODB_URI` line is uncommented
- Restart server after updating `.env`

### "MongoDB connection failed"
- Verify connection string is correct
- Check username/password special characters are URL-encoded
- Ensure IP is whitelisted in MongoDB Cloud dashboard
- Check internet connection

### "Cannot find module 'mongoose'"
- Run `npm install mongoose` in server folder
- Verify package.json has mongoose dependency

## 📚 File Structure

```
server/
├── src/
│   ├── server.js              ← Main Express app (updated for MongoDB)
│   ├── config/
│   │   └── database.js        ← MongoDB connection (new file)
│   ├── models/
│   │   └── Order.js           ← Order schema (new file)
│   ├── services/
│   │   ├── paypal.js
│   │   └── email.js
├── .env.example               ← Updated with MongoDB URI
├── package.json               ← Updated with mongoose dependency
└── data/
    └── orders/                ← No longer used (legacy)
```

## ✅ Migration Complete!

Your backend is now ready for:
- ✅ Scalable order management
- ✅ Real-time payment processing
- ✅ Customer order history
- ✅ Admin reporting and analytics

Next steps:
1. Add MongoDB URI to `.env`
2. Run `npm install mongoose`
3. Start the server with `npm start`
4. Test payment flows from the frontend

Questions? Check the error logs for detailed troubleshooting info.
