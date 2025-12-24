# ⚡ QuickMart Payment System - Quick Reference

## 🚀 Start Everything (2 Terminals)

### Terminal 1: Start Backend
```bash
start-backend.bat
# Wait for: 🚀 QuickMart Backend Server running on http://localhost:5000
```

### Terminal 2: Start Frontend  
```bash
npm run dev
# Wait for: Local: http://localhost:5173
```

✅ **Both running? Visit: http://localhost:5173**

---

## 💳 Payment Methods Status

| Method | Ready? | Setup Required | Notes |
|--------|--------|-----------------|-------|
| **Cash on Delivery** | ✅ Yes | None | Works immediately |
| **Bank Transfer** | ✅ Yes | Update `.env` | Need bank account details |
| **PayPal** | 🔄 Ready | Add to `.env` | Global payment option |
| **Credit Card** | 🔄 Ready | Add to `.env` | Via Razorpay (Bahrain) |

---

## 📋 Configuration Files

### Backend: `server/.env`
```env
# Your bank details here
BANK_RECIPIENT_NAME=Your Name
BANK_ACCOUNT_NUMBER=Your Account
BANK_IBAN=BH94...
BANK_NAME=Your Bank

# Payment gateways (add when ready)
PAYPAL_CLIENT_ID=xxx
RAZORPAY_KEY_ID=xxx
```

### Frontend: `.env.local`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Test Checkout Flow

1. **Add Product:** Click any product → "Add to Cart"
2. **Go to Cart:** Click Cart icon or "View Cart" button
3. **Checkout:** Click "Proceed to Checkout"
4. **Fill Details:** Enter name, email, phone, address
5. **Choose Payment:** Select one:
   - Cash on Delivery (instant)
   - Bank Transfer (add reference)
   - Credit Card (enter card info)
   - PayPal (redirects to PayPal)
6. **Place Order:** Click "Place Order"
7. **Check Order:** File created in `server/data/orders/`

---

## 📂 Check Orders

### View All Orders:
```
server/data/orders/
```

### View Specific Order:
Open `server/data/orders/ABC12345.json` in text editor

### Order contains:
```json
{
  "id": "ABC12345",
  "customer": {
    "name": "Ahmed",
    "email": "ahmed@example.com",
    "phone": "+973 1234 5678",
    "address": "..."
  },
  "items": [...],
  "totalPrice": 150.00,
  "paymentMethod": "bank_transfer",
  "paymentStatus": "pending_verification",
  "orderStatus": "confirmed",
  "transferReference": "REF123",
  "createdAt": "2024-12-20T...",
  "updatedAt": "2024-12-20T..."
}
```

---

## 🔐 Update Bank Details

### Step 1: Open `server/.env`
### Step 2: Change these:
```env
BANK_RECIPIENT_NAME=Your Business Name
BANK_ACCOUNT_NUMBER=Your Real Account
BANK_IBAN=BH94YOUR0000123456789
BANK_NAME=Your Actual Bank Name
```
### Step 3: Save file
### Step 4: Restart backend
### Step 5: Test checkout

Customers will now see your real bank details!

---

## 🆘 Troubleshooting

### Backend won't start?
```bash
# Delete and reinstall dependencies
cd server
rmdir node_modules
npm install
npm start
```

### Can't find orders?
```
Check: server/data/orders/
Make sure folder exists and server is running
```

### Checkout button not working?
1. Check backend is running (http://localhost:5000/api/health)
2. Check `.env.local` has correct API URL
3. Check browser console for errors
4. Restart both frontend and backend

### Orders aren't saving?
1. Check `server/data/orders/` folder exists
2. Check server has write permissions
3. Restart backend
4. Try again

---

## 📊 API Endpoints

Check if backend is working:
```
http://localhost:5000/api/health
```

Get all orders:
```
http://localhost:5000/api/admin/orders
```

Get specific order:
```
http://localhost:5000/api/orders/ABC12345
```

---

## 🎯 Next: Add Real Payment Gateways

### PayPal Setup:
1. Go to https://developer.paypal.com
2. Get Client ID + Secret
3. Add to `server/.env`
4. Done!

### Razorpay Setup (Recommended for Bahrain):
1. Go to https://razorpay.com
2. Create merchant account
3. Get API Key ID + Secret
4. Add to `server/.env`
5. Done!

---

## 📚 Full Documentation

- **Backend Setup:** Read `BACKEND_SETUP.md`
- **Payment Methods:** Read `PAYMENT_SETUP.md`
- **System Overview:** Read `PAYMENT_SYSTEM_READY.md`

---

## 💡 Pro Tips

1. **Test everything locally first** before going live
2. **Keep `.env` files private** - never commit to git
3. **Monitor `server/data/orders/`** for new orders
4. **Backup order files regularly**
5. **Test each payment method** before customers use it
6. **Start with Bank Transfer + COD** - simplest options
7. **Add PayPal/Razorpay later** when confident

---

## ✨ You're Ready!

Payment system is fully functional. Choose your payment methods:
- ✅ Start with **Bank Transfer** + **Cash on Delivery**
- 🔄 Add **PayPal** or **Razorpay** when ready
- 📈 Scale as you grow

**Happy selling! 🚀**
