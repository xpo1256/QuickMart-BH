# ✅ Payment System Setup Checklist

## 🎯 Your Step-by-Step Guide to Getting Payments Working

### PHASE 1: INITIAL SETUP (Do This First!)

#### 1. Create Backend Configuration
- [ ] Navigate to: `server/` folder
- [ ] Copy: `.env.example` → `.env`
- [ ] Open: `server/.env` in text editor
- [ ] Update these fields:
  ```
  BANK_RECIPIENT_NAME = [Your Business Name]
  BANK_ACCOUNT_NUMBER = [Your Account Number]
  BANK_IBAN = [Your IBAN - starts with BH94]
  BANK_NAME = [Your Bank Name]
  ```
- [ ] Save the file
- [ ] ✅ Configuration complete!

#### 2. Install Backend Dependencies
- [ ] Open Terminal
- [ ] Navigate to: `cd server`
- [ ] Run: `npm install`
- [ ] Wait for installation to complete
- [ ] ✅ Dependencies installed!

#### 3. Start Backend Server
- [ ] Run: `start-backend.bat` (or `npm start` if .bat doesn't work)
- [ ] Wait for message: `🚀 QuickMart Backend Server running on http://localhost:5000`
- [ ] ✅ Backend is running!

#### 4. Start Frontend (New Terminal)
- [ ] Open new terminal window
- [ ] Navigate to: Main project folder
- [ ] Run: `npm run dev`
- [ ] Wait for message: `Local: http://localhost:5173`
- [ ] ✅ Frontend is running!

#### 5. Test the Website
- [ ] Open browser: `http://localhost:5173`
- [ ] Website loads successfully
- [ ] You can see products and header
- [ ] Language switcher works (AR/EN)
- [ ] ✅ Website is live!

---

### PHASE 2: TEST PAYMENT METHODS

#### Test 1: Cash on Delivery
- [ ] Add a product to cart
- [ ] Go to Checkout
- [ ] Fill in customer details:
  - Name: [Your Name]
  - Email: [Your Email]
  - Phone: [Your Phone]
  - Address: [Your Address]
- [ ] Select: "Cash on Delivery"
- [ ] Click: "Place Order"
- [ ] ✅ Order created successfully!
- [ ] Verify: Open `server/data/orders/` to see order file

#### Test 2: Bank Transfer
- [ ] Add a product to cart
- [ ] Go to Checkout
- [ ] Fill in customer details
- [ ] Select: "Bank Transfer"
- [ ] You should see your bank details displayed:
  - Recipient: [Your Business Name]
  - Account: [Your Account]
  - IBAN: [Your IBAN]
- [ ] Enter transfer reference: `TEST123`
- [ ] Click: "Place Order"
- [ ] ✅ Order created successfully!
- [ ] Verify: Check order file in `server/data/orders/`

#### Test 3: Credit Card Form
- [ ] Add a product to cart
- [ ] Go to Checkout
- [ ] Fill in customer details
- [ ] Select: "Credit Card"
- [ ] Form appears with fields for:
  - [ ] Cardholder Name
  - [ ] Card Number
  - [ ] Expiry Date
  - [ ] CVV
- [ ] Fill in test card:
  - Name: Test User
  - Number: 4111 1111 1111 1111
  - Expiry: 12/25
  - CVV: 123
- [ ] Click: "Place Order"
- [ ] ✅ Form works properly!

#### Test 4: PayPal (Optional - Now)
- [ ] Add a product to cart
- [ ] Go to Checkout
- [ ] Fill in customer details
- [ ] Select: "PayPal"
- [ ] Click: "Place Order"
- [ ] Should redirect to PayPal page (or prepare to)
- [ ] ✅ PayPal integration ready!

---

### PHASE 3: VERIFY ORDERS ARE BEING SAVED

- [ ] Open folder: `server/data/orders/`
- [ ] You should see files like:
  - `ABC12345.json`
  - `DEF67890.json`
  - etc.
- [ ] Open a JSON file in text editor
- [ ] Verify it contains:
  - [ ] Customer name, email, phone, address
  - [ ] Items purchased
  - [ ] Total price
  - [ ] Payment method selected
  - [ ] Payment status
  - [ ] Order timestamp
- [ ] ✅ Orders are being saved correctly!

---

### PHASE 4: TEST DIFFERENT SCENARIOS

#### Scenario 1: Multiple Orders
- [ ] Create 3-5 different orders
- [ ] Use different payment methods
- [ ] Verify all orders in `server/data/orders/`
- [ ] ✅ Multiple orders work!

#### Scenario 2: Different Products
- [ ] Add different products to cart
- [ ] Test checkout with mixed items
- [ ] Verify order contains correct items
- [ ] Verify total price is correct
- [ ] ✅ Multiple items work!

#### Scenario 3: Different Addresses
- [ ] Test checkout with different addresses
- [ ] Verify addresses are saved correctly
- [ ] ✅ Address handling works!

#### Scenario 4: Bilingual Testing
- [ ] Switch language to Arabic (Click globe icon)
- [ ] Go through checkout in Arabic
- [ ] Verify all text is in Arabic
- [ ] Place an order
- [ ] Switch back to English
- [ ] ✅ Bilingual support works!

---

### PHASE 5: ADD PAYMENT GATEWAY CREDENTIALS (Optional)

#### If You Want to Add PayPal:
- [ ] Go to: https://developer.paypal.com
- [ ] Sign in to your PayPal account
- [ ] Create an app or find existing one
- [ ] Copy: Client ID
- [ ] Copy: Client Secret
- [ ] Open: `server/.env`
- [ ] Add:
  ```
  PAYPAL_MODE=sandbox
  PAYPAL_CLIENT_ID=your_client_id_here
  PAYPAL_CLIENT_SECRET=your_secret_here
  ```
- [ ] Save file
- [ ] Restart backend
- [ ] ✅ PayPal ready!

#### If You Want to Add Razorpay (Recommended for Bahrain):
- [ ] Go to: https://razorpay.com
- [ ] Create merchant account
- [ ] Complete KYC verification
- [ ] Go to: Settings → API Keys
- [ ] Copy: Key ID
- [ ] Copy: Key Secret
- [ ] Open: `server/.env`
- [ ] Add:
  ```
  RAZORPAY_KEY_ID=your_key_id
  RAZORPAY_KEY_SECRET=your_secret
  ```
- [ ] Save file
- [ ] Restart backend
- [ ] ✅ Razorpay ready!

---

### PHASE 6: PRODUCTION PREPARATION

#### Before Going Live:
- [ ] All payment methods tested locally ✅
- [ ] Orders saving correctly ✅
- [ ] Email configuration (optional) complete
- [ ] Bank details updated and verified
- [ ] Payment gateway credentials added (if using)
- [ ] `.env` file is secure (never committed to git)
- [ ] Order backup system in place
- [ ] Admin can view orders

#### Deploy Backend:
- [ ] [ ] Choose hosting (Heroku, Render, DigitalOcean, etc.)
- [ ] [ ] Set up Node.js environment
- [ ] [ ] Upload backend code
- [ ] [ ] Set environment variables on host
- [ ] [ ] Test backend endpoints
- [ ] [ ] ✅ Backend deployed!

#### Deploy Frontend:
- [ ] [ ] Choose hosting (Vercel, Netlify, etc.)
- [ ] [ ] Build frontend: `npm run build`
- [ ] [ ] Upload build to hosting
- [ ] [ ] Update API URL in `.env.local` to production backend
- [ ] [ ] Test website
- [ ] [ ] ✅ Frontend deployed!

#### Monitor First Orders:
- [ ] [ ] Check orders daily for first week
- [ ] [ ] Verify bank transfers are received
- [ ] [ ] Manual verify payments if needed
- [ ] [ ] Send confirmation emails to customers
- [ ] [ ] Monitor for issues

---

## 📋 Files You Created/Updated

### Backend Files Created:
- [x] `server/src/server.js` - Main backend
- [x] `server/src/services/paypal.js` - PayPal integration
- [x] `server/src/services/razorpay.js` - Credit card processing
- [x] `server/src/services/email.js` - Email notifications
- [x] `server/package.json` - Dependencies list
- [x] `server/.env.example` - Config template
- [x] `server/.gitignore` - Security settings
- [x] `server/data/orders/.gitkeep` - Order storage directory

### Frontend Files Created/Updated:
- [x] `src/app/pages/CheckoutPageNew.tsx` - Updated checkout with API
- [x] `.env.local.example` - Frontend config

### Documentation Files Created:
- [x] `QUICK_START.md` - 5 minute quick start guide ⭐
- [x] `BACKEND_SETUP.md` - Complete backend setup
- [x] `PAYMENT_SETUP.md` - Payment methods guide
- [x] `PAYMENT_SYSTEM_READY.md` - System overview
- [x] `PAYMENT_SYSTEM_COMPLETE.md` - Complete implementation guide
- [x] `START_HERE.md` - This checklist!

### Configuration Files (You Need to Create):
- [ ] `server/.env` - Backend configuration (URGENT!)
- [ ] `.env.local` - Frontend configuration (Optional but recommended)

---

## 🎯 Key Milestones

### Week 1: Setup & Testing
- [x] Backend server created
- [x] Payment methods coded
- [x] Frontend updated
- [ ] **TO DO:** Create .env file and update bank details
- [ ] **TO DO:** Test all payment methods locally
- [ ] **TO DO:** Verify orders are saving

### Week 2: Optimization
- [ ] Add email notifications
- [ ] Add PayPal integration
- [ ] Add Razorpay integration
- [ ] Create order tracking page

### Week 3: Launch
- [ ] Deploy backend to server
- [ ] Deploy frontend to hosting
- [ ] Go live!
- [ ] Monitor first orders

### Week 4+: Scale
- [ ] Gather customer feedback
- [ ] Improve based on feedback
- [ ] Add advanced features
- [ ] Grow your business!

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't do these:**
- Don't skip creating `server/.env` file
- Don't commit `.env` file to git
- Don't use test credentials in production
- Don't skip testing before going live
- Don't ignore error messages in console
- Don't forget to restart backend after .env changes
- Don't lose your order data - backup regularly!

✅ **Do these instead:**
- ✅ Create .env with your real bank details NOW
- ✅ Test each payment method thoroughly
- ✅ Keep .env file secure and private
- ✅ Monitor orders daily
- ✅ Read error messages and fix them
- ✅ Backup order data regularly
- ✅ Ask for help if stuck

---

## 📞 Getting Help

### If Backend Won't Start:
1. Check terminal shows correct port (5000)
2. Check no other app is using port 5000
3. Check Node.js is installed: `node --version`
4. Delete `node_modules` and run `npm install` again
5. Check `server/.env` exists

### If Frontend Won't Connect to Backend:
1. Check backend is running on http://localhost:5000
2. Check `.env.local` has correct API URL
3. Check browser console for errors (F12)
4. Check firewall isn't blocking connections

### If Orders Aren't Saving:
1. Check `server/data/orders/` folder exists
2. Check backend has write permissions
3. Check backend is running
4. Look for error messages in terminal

### If Payment Methods Aren't Working:
1. Check `server/.env` is configured correctly
2. Check all required payment gateway keys are added
3. Check backend was restarted after changes
4. Check browser console for JavaScript errors

---

## 📊 Quick Status Check

### Before You Start:
- [ ] Backend code created ✅
- [ ] Frontend code updated ✅
- [ ] Documentation written ✅
- [ ] Dependencies listed ✅
- [ ] Examples provided ✅
- **YOUR TURN:** Now you need to configure and test!

### To Check System is Working:

1. **Backend Running?**
   Visit: http://localhost:5000/api/health
   Should see: `{"status":"Server is running",...}`

2. **Frontend Running?**
   Visit: http://localhost:5173
   Should see: QuickMart website with products

3. **Orders Saving?**
   Check: `server/data/orders/` folder
   Should see: Order JSON files

4. **Payment Methods Work?**
   Checkout page should show:
   - [ ] PayPal option
   - [ ] Bank Transfer option
   - [ ] Credit Card option
   - [ ] Cash on Delivery option

---

## 🚀 Next Action

### RIGHT NOW:
1. Open `server/.env.example`
2. Save as `server/.env`
3. Update your bank details
4. Run `start-backend.bat`
5. Run `npm run dev` in new terminal
6. Visit http://localhost:5173
7. Test a checkout

### If All Works:
✅ **Congratulations! Your payment system is ready!**

### Questions?
📖 Read `QUICK_START.md` or `BACKEND_SETUP.md`

---

**Start with STEP 1 below immediately:**

---

## 🎬 START HERE - DO THIS NOW!

### STEP 1: Create Backend Configuration (5 minutes)
```
1. Open: server\.env.example in text editor
2. Save As: server\.env
3. Update these 4 lines:
   - BANK_RECIPIENT_NAME = Your Business Name
   - BANK_ACCOUNT_NUMBER = Your Account Number
   - BANK_IBAN = BH94XXXXXXXXXX
   - BANK_NAME = Your Bank
4. Save the file
```

### STEP 2: Start Backend (30 seconds)
```
1. Double-click: start-backend.bat
2. Wait for: "🚀 QuickMart Backend Server running..."
```

### STEP 3: Start Frontend (30 seconds)
```
1. Open new terminal
2. Run: npm run dev
3. Wait for: "Local: http://localhost:5173"
```

### STEP 4: Test Checkout (2 minutes)
```
1. Visit: http://localhost:5173
2. Add product to cart
3. Go to checkout
4. Select "Cash on Delivery"
5. Place Order
6. Check: server/data/orders/ for order file
```

### ✅ DONE! Payment system is working!

---

**Questions? Read the guides:**
- QUICK_START.md (5 minute overview)
- BACKEND_SETUP.md (detailed setup)
- PAYMENT_SETUP.md (payment options)

**Good luck! 🚀**
