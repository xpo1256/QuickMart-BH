import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import mongoose from 'mongoose';

// Import MongoDB connection and models
import { connectDB } from './config/database.js';
import Order from './models/Order.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Import payment services
import { processPayPalPayment, verifyPayPalPayment } from './services/paypal.js';
import { sendOrderConfirmation } from './services/email.js';
import { createTapPayment, verifyTapSignatureRaw } from './services/tap.js';

// `.env` is loaded at process start via the side-effect import above (`dotenv/config`).
// Keep `dotenv` import available for conditional fallback loads below.
try {
  if (!process.env.TAP_SECRET_KEY) {
    const tryPaths = [
      path.resolve(process.cwd(), 'server', '.env'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '..', 'server', '.env')
    ];
    for (const pth of tryPaths) {
      try {
        const r = dotenv.config({ path: pth });
        if (r && r.parsed) {
          console.info('Loaded .env from', pth);
        }
        if (process.env.TAP_SECRET_KEY) break;
      } catch (e) {
        // ignore
      }
    }
  }
  console.info('TAP_SECRET_KEY present=', !!process.env.TAP_SECRET_KEY);
} catch (e) {
  console.error('Error while attempting fallback .env loads', e && (e.message || e));
}

// Log PayPal config at startup for diagnostics (mask secret)
  try {
    const pmode = process.env.PAYPAL_MODE || 'sandbox';
    console.info(`PayPal mode=${pmode} client_id_present=${!!process.env.PAYPAL_CLIENT_ID} currency=${process.env.PAYPAL_CURRENCY || 'USD'}`);
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.warn('PayPal credentials missing. PayPal calls will fail until PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set in .env');
    }
  } catch (e) { /* ignore logging errors */ }

const JWT_SECRET = process.env.JWT_SECRET || '';
// Enforce presence of a strong JWT secret in production
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production. Aborting startup.');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set. Using insecure fallback for development only.');
}

const app = express();

// Security middleware
// Helmet with sensible defaults. Add CSP or other policies cautiously.
app.use(helmet({
  contentSecurityPolicy: false, // disable CSP by default to avoid breaking frontend; set in deployment if needed
}));

// Logging: enable verbose request logging only in non-production to avoid leaking data
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'));
}

// Basic rate limiter (global)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Additional stricter limits for auth-related endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts, please try later.' });
app.post('/api/auth/login', authLimiter);
app.post('/api/admin/login', authLimiter);

// CORS
app.use(cors({
  // Support multiple frontend origins (use FRONTEND_URLS env or FRONTEND_URL)
  // Example: FRONTEND_URLS=http://localhost:5173,http://localhost:5175
  origin: function (origin, callback) {
    // Build allowed list from FRONTEND_URLS + FRONTEND_URL
    // In production, FRONTEND_URL should be set to your production domain.
    const fromUrls = (process.env.FRONTEND_URLS || '').split(',').map(s => s.trim()).filter(Boolean);
    const fromSingle = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : [];
    const allowed = Array.from(new Set([...fromUrls, ...fromSingle]));
    // allow non-browser tools like curl/postman (no origin)
    if (!origin) return callback(null, true);
    // Strict allowlist: only exact origin matches
    if (allowed.length > 0 && allowed.indexOf(origin) !== -1) return callback(null, true);
    // If no allowed origins configured, deny cross-origin browser requests
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
}));

// Limit JSON body size to mitigate large payload attacks
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Ensure uploads/avatars directory exists
const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
try { fs.mkdirSync(avatarsDir, { recursive: true }); } catch (e) { /* ignore */ }

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Invalid avatar file type'));
  }
});

// Ensure uploads/products directory exists for admin product media
const productsDir = path.join(process.cwd(), 'uploads', 'products');
try { fs.mkdirSync(productsDir, { recursive: true }); } catch (e) { /* ignore */ }

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});
const uploadMedia = multer({
  storage: productStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg'
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Invalid media file type'));
  }
});

// Middleware to authenticate JWT and attach userId to req
async function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const uid = payload.sub;
    const user = await User.findById(uid).select('name email isAdmin avatar phone');
    if (!user) return res.status(401).json({ error: 'Invalid token user' });
    req.user = { id: String(user._id), name: user.name, email: user.email, isAdmin: !!user.isAdmin, avatar: user.avatar, phone: user.phone };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin key middleware for admin routes
function requireAdminKey(req, res, next) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return res.status(500).json({ error: 'Admin key not configured on server' });
  // Allow admin authentication via HttpOnly cookie OR `x-admin-key` header for local diagnostics.
  const providedCookie = req.cookies && req.cookies.admin_session;
  const providedHeader = req.headers['x-admin-key'] || req.headers['X-Admin-Key'];
  if ((providedCookie && providedCookie === adminKey) || (providedHeader && String(providedHeader) === adminKey)) return next();
  return res.status(401).json({ error: 'Unauthorized: admin login required' });
}

// Admin login: set HttpOnly cookie if key matches
app.post('/api/admin/login', async (req, res) => {
  try {
    const { key } = req.body || {};
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey) return res.status(500).json({ error: 'Admin key not configured on server' });
    if (!key || key !== adminKey) return res.status(401).json({ error: 'Invalid admin key' });
    const cookieOptions = { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    // set a dedicated admin session cookie (secure & strict in production)
    res.cookie('admin_session', key, cookieOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Unified cookie-based auth handlers are implemented below.

// Simple auth middleware (JWT in HttpOnly cookie `auth_token`)
function requireAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication' });
  }
}

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const { avatar, phone } = req.body || {};
    const u = new User({ name: String(name), email: String(email).toLowerCase(), passwordHash: hash, avatar: avatar || undefined, phone: phone || undefined });
    await u.save();
    const token = jwt.sign({ id: String(u._id), name: u.name, email: u.email, avatar: u.avatar, phone: u.phone }, JWT_SECRET, { expiresIn: '30d' });
    // Set secure cookie flag and strict sameSite when running in production
    const authCookieOptions = { httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' };
    if (process.env.NODE_ENV === 'production') authCookieOptions.secure = true;
    res.cookie('auth_token', token, authCookieOptions);
    res.json({ success: true, user: { id: String(u._id), name: u.name, email: u.email, avatar: u.avatar, phone: u.phone } });
  } catch (err) {
    console.error('Signup error', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const u = await User.findOne({ email: String(email).toLowerCase() });
    if (!u) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: String(u._id), name: u.name, email: u.email, avatar: u.avatar, phone: u.phone }, JWT_SECRET, { expiresIn: '30d' });
    res.cookie('auth_token', token, { httpOnly: true, sameSite: 'lax', ...(process.env.NODE_ENV === 'production' ? { secure: true } : {}) });
    res.json({ success: true, user: { id: String(u._id), name: u.name, email: u.email, avatar: u.avatar, phone: u.phone } });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.cookies && req.cookies.auth_token;
    if (!token) return res.status(200).json({ user: null });
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(200).json({ user: null });
  }
});

// Update profile (name, phone, avatar) for cookie-based sessions
app.put('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const tokenUser = req.user || {};
    const uid = tokenUser.id || tokenUser.sub;
    if (!uid) return res.status(401).json({ error: 'Not authenticated' });
    const { name, phone, avatar } = req.body || {};
    const updated = await User.findByIdAndUpdate(uid, { ...(name ? { name } : {}), ...(phone ? { phone } : {}), ...(avatar ? { avatar } : {}) }, { new: true }).select('name email avatar phone');
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const token = jwt.sign({ id: String(updated._id), name: updated.name, email: updated.email, avatar: updated.avatar, phone: updated.phone }, JWT_SECRET, { expiresIn: '30d' });
    res.cookie('auth_token', token, { httpOnly: true, sameSite: 'lax', ...(process.env.NODE_ENV === 'production' ? { secure: true } : {}) });
    res.json({ success: true, user: { id: String(updated._id), name: updated.name, email: updated.email, avatar: updated.avatar, phone: updated.phone } });
  } catch (err) {
    console.error('Update profile error', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar file
app.post('/api/auth/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const tokenUser = req.user || {};
    const uid = tokenUser.id || tokenUser.sub;
    if (!uid) return res.status(401).json({ error: 'Not authenticated' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    const updated = await User.findByIdAndUpdate(uid, { avatar: fileUrl }, { new: true }).select('name email avatar phone');
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, avatar: updated.avatar });
  } catch (err) {
    console.error('Avatar upload error', err);
    return res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    res.clearCookie('auth_token');
    res.json({ success: true });
  } catch (err) {
    console.error('Auth logout error', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Admin check: verify HttpOnly cookie
app.get('/api/admin/check', (req, res) => {
  try {
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey) return res.status(500).json({ error: 'Admin key not configured on server' });
    const providedCookie = req.cookies && req.cookies.admin_session;
    if (providedCookie && providedCookie === adminKey) return res.json({ ok: true });
    return res.status(401).json({ ok: false });
  } catch (err) {
    console.error('Admin check error', err);
    res.status(500).json({ ok: false });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  try {
    res.clearCookie('admin_session');
    res.json({ success: true });
  } catch (err) {
    console.error('Admin logout error', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ============================================
// ORDER MANAGEMENT (MongoDB)
// ============================================

let useFileDb = false;
const ordersDir = path.join(process.cwd(), 'data', 'orders');

// File-based fallback implementations
function ensureOrdersDir() {
  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
  }
}

async function fileSaveOrder(order) {
  try {
    ensureOrdersDir();
    const orderPath = path.join(ordersDir, `${order.id}.json`);
    fs.writeFileSync(orderPath, JSON.stringify(order, null, 2));
    return order;
  } catch (error) {
    console.error('Error saving order to file:', error);
    throw error;
  }
}

function fileLoadOrder(orderId) {
  try {
    const orderPath = path.join(ordersDir, `${orderId}.json`);
    if (fs.existsSync(orderPath)) {
      return JSON.parse(fs.readFileSync(orderPath, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading order from file:', error);
  }
  return null;
}

function fileGetAllOrders() {
  try {
    ensureOrdersDir();
    const files = fs.readdirSync(ordersDir);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(ordersDir, f), 'utf-8')))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error loading orders from file:', error);
    return [];
  }
}

// Save order to MongoDB (or file fallback)
async function saveOrder(order) {
  if (useFileDb) return fileSaveOrder(order);
  try {
    const existingOrder = await Order.findOne({ id: order.id });
    if (existingOrder) {
      const updated = await Order.findOneAndUpdate(
        { id: order.id },
        { ...order, updatedAt: new Date() },
        { new: true }
      );
      return updated;
    } else {
      const newOrder = new Order({
        ...order,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return await newOrder.save();
    }
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

// Load order from MongoDB
async function loadOrder(orderId) {
  if (useFileDb) return fileLoadOrder(orderId);
  try {
    return await Order.findOne({ id: orderId });
  } catch (error) {
    console.error('Error loading order:', error);
    return null;
  }
}

// Get all orders
async function getAllOrders() {
  if (useFileDb) return fileGetAllOrders();
  try {
    return await Order.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
}

// ============================================
// ROUTES
// ============================================

// --------------------------------------------
// PRODUCT ROUTES (CRUD)
// --------------------------------------------

// Get all products
app.get('/api/products', async (req, res) => {
  if (useFileDb) return res.status(503).json({ error: 'Products not available: database not connected' });
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get all categories (public)
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Admin: create category
app.post('/api/admin/categories', requireAdminKey, async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Name required' });
    const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(409).json({ error: 'Category exists' });
    const cat = new Category({ name: String(name), slug });
    await cat.save();
    res.json({ success: true, category: cat });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Admin: delete category
app.delete('/api/admin/categories/:id', requireAdminKey, async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    // check linked products
    const linked = await Product.findOne({ category: cat.name });
    const force = req.query.force === 'true';
    if (linked && !force) return res.status(400).json({ error: 'Category has products. Use ?force=true to remove and clear category from products.' });
    if (linked && force) {
      // clear category from products that reference it
      await Product.updateMany({ category: cat.name }, { $unset: { category: '' } });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Admin diagnostics: report DB mode and counts
app.get('/api/admin/diagnostics', requireAdminKey, async (req, res) => {
  try {
    const conn = mongoose.connection;
    const host = conn.host || (conn.client && conn.client.s && conn.client.s.url) || 'unknown';
    const dbName = conn.name || (conn.client && conn.client.s && conn.client.s.options && conn.client.s.options.dbName) || 'unknown';
    const usersCount = await mongoose.model('User').countDocuments().catch(()=>null);
    const productsCount = await mongoose.model('Product').countDocuments().catch(()=>null);
    return res.json({ useFileDb: !!useFileDb, host, dbName, usersCount, productsCount });
  } catch (err) {
    console.error('Diagnostics error', err);
    return res.status(500).json({ error: 'Diagnostics failed' });
  }
});

// Get product by id
app.get('/api/products/:id', async (req, res) => {
  if (useFileDb) return res.status(503).json({ error: 'Product not available: database not connected' });
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Submit a product review (authenticated)
app.post('/api/products/:id/reviews', authenticateJWT, async (req, res) => {
  if (useFileDb) return res.status(503).json({ error: 'Cannot add review: database not connected' });
  try {
    const { rating, comment } = req.body || {};
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const r = Number(rating) || 0;
    if (r < 0 || r > 5) return res.status(400).json({ error: 'Invalid rating' });
    const review = { _id: Product.schema.path('reviewsList').caster ? undefined : undefined, userId: req.user.id, name: req.user.name || 'Guest', email: req.user.email || '', avatar: req.user.avatar || undefined, rating: r, comment: String(comment || ''), createdAt: new Date() };
    // ensure reviewsList exists
    product.reviewsList = product.reviewsList || [];
    // push with generated ObjectId
    product.reviewsList.push({ userId: req.user.id, name: req.user.name || 'Guest', email: req.user.email || '', avatar: req.user.avatar || undefined, rating: r, comment: String(comment || ''), createdAt: new Date() });
    // update reviews count and average rating
    product.reviews = product.reviewsList.length;
    const avg = product.reviewsList.reduce((s, it) => s + (Number(it.rating) || 0), 0) / (product.reviewsList.length || 1);
    product.rating = Math.round(avg * 10) / 10; // keep one decimal
    await product.save();
    res.json({ success: true, rating: product.rating, reviews: product.reviews });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Admin: create product
app.post('/api/admin/products', requireAdminKey, async (req, res) => {
  if (useFileDb) return res.status(503).json({ error: 'Cannot create product: database not connected' });
  try {
    const payload = req.body || {};
    // Prevent admins from setting rating/reviews directly — those come from user activity
    delete payload.rating;
    delete payload.reviews;
    // Ensure numeric price
    if (payload.price) payload.price = Number(payload.price);
    if (!payload.currency) payload.currency = 'BHD';
    // sanitize images array
    if (payload.images && Array.isArray(payload.images)) {
      payload.images = payload.images.filter(Boolean).map(String);
    } else {
      payload.images = [];
    }
    // Validate category exists (if provided)
    if (payload.category) {
      const cat = await Category.findOne({ name: String(payload.category) });
      if (!cat) return res.status(400).json({ error: 'Invalid category' });
      payload.category = cat.name;
    }
    const product = new Product({ ...payload });
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: upload product media (images/videos)
app.post('/api/admin/products/upload', requireAdminKey, uploadMedia.array('media', 20), async (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded' });
    const base = `${req.protocol}://${req.get('host')}/uploads/products`;
    const urls = (req.files || []).map((f) => `${base}/${f.filename}`);
    return res.json({ success: true, urls });
  } catch (err) {
    console.error('Product media upload error', err);
    return res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Admin: update product
app.put('/api/admin/products/:id', requireAdminKey, async (req, res) => {
  if (useFileDb) return res.status(503).json({ error: 'Cannot update product: database not connected' });
  try {
    const payload = req.body || {};
    // Prevent direct rating manipulation
    delete payload.rating;
    delete payload.reviews;
    if (payload.price) payload.price = Number(payload.price);
    // sanitize images array
    if (payload.images && Array.isArray(payload.images)) {
      payload.images = payload.images.filter(Boolean).map(String);
    }
    // Validate category exists (if provided)
    if (payload.category) {
      const cat = await Category.findOne({ name: String(payload.category) });
      if (!cat) return res.status(400).json({ error: 'Invalid category' });
      payload.category = cat.name;
    }
    console.log('Admin update product payload:', req.params.id, payload);
    const updated = await Product.findByIdAndUpdate(req.params.id, { ...payload, updatedAt: new Date() }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product', details: String(error) });
  }
});

// Admin: delete product
app.delete('/api/admin/products/:id', requireAdminKey, async (req, res) => {
  if (useFileDb) return res.status(503).json({ error: 'Cannot delete product: database not connected' });
  try {
    const removed = await Product.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// DB diagnostics
import { isDBConnected } from './config/database.js';
app.get('/api/diagnostics/db', async (req, res) => {
  try {
    const status = isDBConnected();
    res.json({ connected: status });
  } catch (err) {
    console.error('DB diagnostics error', err);
    res.status(500).json({ error: 'Diagnostics failed' });
  }
});

// Create order
app.post('/api/orders/create', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      items,
      totalPrice,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress || !items || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = uuidv4().substring(0, 8).toUpperCase();
    
    const order = {
      id: orderId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress: deliveryAddress,
      items,
      totalPrice,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      userId: 'guest',
    };

    await saveOrder(order);

    res.json({
      success: true,
      orderId: order.id,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await loadOrder(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get all orders (admin)
app.get('/api/admin/orders', requireAdminKey, async (req, res) => {
  try {
    const { paymentStatus, orderStatus, from, to, q } = req.query || {};
    let orders = await getAllOrders();
    if (paymentStatus) orders = orders.filter(o => String(o.paymentStatus) === String(paymentStatus));
    if (orderStatus) orders = orders.filter(o => String(o.orderStatus) === String(orderStatus));
    if (from) {
      const fromDate = new Date(String(from));
      orders = orders.filter(o => new Date(o.createdAt) >= fromDate);
    }
    if (to) {
      const toDate = new Date(String(to));
      orders = orders.filter(o => new Date(o.createdAt) <= toDate);
    }
    if (q) {
      const ql = String(q).toLowerCase();
      orders = orders.filter(o => (o.customerEmail && String(o.customerEmail).toLowerCase().includes(ql)) || (o.id && String(o.id).toLowerCase().includes(ql)));
    }
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: list all reviews across products
app.get('/api/admin/reviews', requireAdminKey, async (req, res) => {
  try {
    const products = await Product.find({}, { reviewsList: 1, name: 1 });
    const all = [];
    for (const p of products) {
      if (Array.isArray(p.reviewsList)) {
        for (const r of p.reviewsList) {
          all.push({ productId: p._id, productName: p.name, review: r });
        }
      }
    }
    res.json(all);
  } catch (err) {
    console.error('Error listing reviews:', err);
    res.status(500).json({ error: 'Failed to list reviews' });
  }
});

// Admin: delete a review by id
app.delete('/api/admin/products/:productId/reviews/:reviewId', requireAdminKey, async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const p = await Product.findById(productId);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    const before = p.reviewsList.length;
    p.reviewsList = p.reviewsList.filter(r => String(r._id) !== String(reviewId));
    if (p.reviewsList.length === before) return res.status(404).json({ error: 'Review not found' });
    p.reviews = p.reviewsList.length;
    const avg = p.reviewsList.reduce((s, it) => s + (Number(it.rating) || 0), 0) / (p.reviewsList.length || 1);
    p.rating = p.reviewsList.length ? Math.round(avg * 10) / 10 : 0;
    await p.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Admin: export orders as CSV (supports optional filters)
app.get('/api/admin/orders/export', requireAdminKey, async (req, res) => {
  try {
    const { paymentStatus, orderStatus, from, to } = req.query || {};
    let orders = await getAllOrders();
    // filter
    if (paymentStatus) orders = orders.filter(o => String(o.paymentStatus) === String(paymentStatus));
    if (orderStatus) orders = orders.filter(o => String(o.orderStatus) === String(orderStatus));
    if (from) {
      const fromDate = new Date(String(from));
      orders = orders.filter(o => new Date(o.createdAt) >= fromDate);
    }
    if (to) {
      const toDate = new Date(String(to));
      orders = orders.filter(o => new Date(o.createdAt) <= toDate);
    }

    // build CSV
    const headers = ['orderId', 'customerName', 'customerEmail', 'customerPhone', 'paymentMethod', 'paymentProvider', 'paymentId', 'paymentStatus', 'orderStatus', 'totalPrice', 'createdAt', 'trackingProvider', 'trackingNumber'];
    const rows = orders.map(o => (
      headers.map(h => {
        const v = (h === 'orderId' ? o.id : o[h] ?? '');
        // escape quotes
        if (typeof v === 'string') return '"' + v.replace(/"/g, '""') + '"';
        return '"' + String(v) + '"';
      }).join(',')
    ));
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting orders CSV:', err);
    res.status(500).json({ error: 'Failed to export orders' });
  }
});

// Get single order (admin)
// Export single order as CSV (admin)
app.get('/api/admin/orders/:orderId/export', requireAdminKey, async (req, res) => {
  try {
    const order = await loadOrder(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const headers = ['orderId', 'customerName', 'customerEmail', 'customerPhone', 'paymentMethod', 'paymentProvider', 'paymentId', 'paymentStatus', 'orderStatus', 'totalPrice', 'createdAt', 'trackingProvider', 'trackingNumber', 'items'];
    const row = headers.map(h => {
      let v = '';
      if (h === 'orderId') v = order.id;
      else if (h === 'items') v = Array.isArray(order.items) ? order.items.map(it => `${it.name} x${it.quantity}`).join('; ') : '';
      else v = order[h] ?? '';
      if (typeof v === 'string') return '"' + v.replace(/"/g, '""') + '"';
      return '"' + String(v) + '"';
    }).join(',');
    const csv = [headers.join(','), row].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="order-${order.id}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Error exporting single order CSV:', err);
    res.status(500).json({ error: 'Failed to export order' });
  }
});

app.get('/api/admin/orders/:orderId', requireAdminKey, async (req, res) => {
  try {
    const order = await loadOrder(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order (admin) - change status, tracking, etc.
app.put('/api/admin/orders/:orderId', requireAdminKey, async (req, res) => {
  try {
    const updates = req.body || {};
    const orderId = req.params.orderId;
    let order = await loadOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // allowed fields to update
    const allowed = ['orderStatus', 'paymentStatus', 'trackingNumber', 'trackingProvider', 'updatedAt'];
    for (const k of Object.keys(updates)) {
      if (allowed.includes(k)) {
        order[k] = updates[k];
      }
    }
    order.updatedAt = new Date();
    await saveOrder(order);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ============================================
// PAYMENT ROUTES
// ============================================

// PayPal: Create payment
app.post('/api/payments/paypal/create', async (req, res) => {
  try {
    const { orderId, totalPrice, customerEmail } = req.body;

    // Debug: dump incoming request body for troubleshooting PayPal creation
    try {
      console.debug('PayPal create request body:', JSON.stringify(req.body));
    } catch (e) {
      console.debug('PayPal create request body (non-serializable)');
    }

    const order = await loadOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Create PayPal payment via service
    const paymentObj = await processPayPalPayment(orderId, Number(totalPrice || 0), customerEmail || '');
    // find approval url
    const approvalLink = (paymentObj && Array.isArray(paymentObj.links)) ? (paymentObj.links.find(l => l.rel === 'approval_url') || paymentObj.links.find(l => l.rel === 'approval_url' || l.rel === 'approval')) : null;
    const approvalUrl = approvalLink ? approvalLink.href : (paymentObj && paymentObj.links && paymentObj.links[0] && paymentObj.links[0].href) || null;

    if (!approvalUrl) {
      console.error('No approval URL returned from PayPal', paymentObj);
      return res.status(500).json({ error: 'PayPal did not return an approval URL' });
    }

    console.log('PayPal approval URL:', approvalUrl);

    res.json({
      success: true,
      paymentUrl: approvalUrl,
      paymentId: paymentObj && paymentObj.id,
      message: 'PayPal payment ready. Redirect to PayPal to complete payment.',
    });
  } catch (error) {
    // Detailed logging to capture SDK error payloads
    try {
      if (error && error.response) {
        console.error('PayPal create error response:', JSON.stringify(error.response, null, 2));
      }
    } catch (logErr) {
      console.error('Error stringifying PayPal error.response:', logErr);
    }
    console.error('Error creating PayPal payment:', error && (error.stack || error));
    const respBody = { error: 'Failed to create payment' };
    if (process.env.NODE_ENV !== 'production') {
      try {
        if (error && error.response) respBody.paypal = error.response;
        else respBody.details = error && (error.message || String(error));
      } catch (e) {
        respBody.details = 'Unable to serialize error details';
      }
    }
    res.status(500).json(respBody);
  }
});

// PayPal: Verify payment
app.post('/api/payments/paypal/verify', async (req, res) => {
  try {
    const { orderId, paymentId, payerId } = req.body;

    const order = await loadOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Verify with PayPal
    const verification = await verifyPayPalPayment(paymentId, payerId);
    if (!verification || verification.state !== 'approved' && verification.state !== 'completed') {
      console.error('PayPal verification failed', verification);
      return res.status(400).json({ error: 'PayPal verification failed' });
    }

    // Update order payment status
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paymentId = paymentId;
    order.updatedAt = new Date().toISOString();

    await saveOrder(order);

    // Send confirmation email
    await sendOrderConfirmation(order);

    res.json({
      success: true,
      message: 'Payment verified and order confirmed',
      order,
      verification,
    });
  } catch (error) {
    console.error('Error verifying PayPal payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Razorpay: create order (server-side)
app.post('/api/payments/razorpay/create', async (req, res) => {
  try {
    const { orderId, totalPrice } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'Missing orderId' });
    const order = await loadOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const razorOrder = await createRazorpayOrder(orderId, Number(totalPrice || 0));
    res.json({ success: true, order: razorOrder, keyId: process.env.RAZORPAY_KEY_ID || '' });
  } catch (error) {
    console.error('Razorpay create error:', error);
    res.status(500).json({ error: 'Failed to create razorpay order', details: error && error.message });
  }
});

// Razorpay: verify payment
app.post('/api/payments/razorpay/verify', async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'Missing orderId' });
    const valid = verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!valid) return res.status(400).json({ error: 'Invalid signature' });

    const order = await loadOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paymentId = razorpay_payment_id;
    order.updatedAt = new Date().toISOString();
    await saveOrder(order);
    await sendOrderConfirmation(order);

    res.json({ success: true, order });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ error: 'Failed to verify payment', details: error && error.message });
  }
});

// Credit card (Tap) - create hosted checkout session
app.post('/api/payments/credit/create', async (req, res) => {
  try {
    const { orderId, totalPrice, customerEmail } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'Missing orderId' });
    const order = await loadOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Diagnostic logging: show whether TAP_SECRET_KEY is present at request time (do NOT log key material)
    try {
      console.info('Credit create request: TAP_SECRET_KEY present=', !!process.env.TAP_SECRET_KEY);
    } catch (e) { /* ignore */ }

    try {
      const sess = await createTapPayment(orderId, Number(totalPrice || 0), { email: customerEmail });
      return res.json({ success: true, paymentUrl: sess.paymentUrl });
    } catch (err) {
      console.error('Tap payment creation error:', err && (err.message || err));
      return res.status(501).json({ error: 'Payment gateway not configured', details: err && err.message });
    }
  } catch (error) {
    console.error('Credit create error:', error);
    res.status(500).json({ error: 'Failed to create credit payment' });
  }
});

// Tap webhook endpoint - receives raw body for signature verification
app.post('/api/payments/tap/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['tap-signature'] || req.headers['Tap-Signature'] || req.headers['x-tap-signature'];
    const raw = req.body; // Buffer from express.raw

    // Verify signature
    let valid = false;
    try {
      valid = verifyTapSignatureRaw(raw, signature);
    } catch (e) {
      console.error('Tap signature verification threw error:', e && (e.message || e));
      return res.status(400).send('invalid signature');
    }

    if (!valid) {
      console.warn('Tap webhook: invalid signature');
      return res.status(400).send('invalid signature');
    }

    // Parse payload
    let payload = null;
    try {
      payload = JSON.parse(raw.toString());
    } catch (e) {
      console.error('Tap webhook: failed to parse JSON body', e && (e.message || e));
      return res.status(400).send('invalid payload');
    }

    // Attempt to extract merchant_order_id and payment id from known shapes
    const merchantOrderId = (
      (payload && payload.data && payload.data.object && payload.data.object.merchant_order_id) ||
      (payload && payload.data && payload.data.merchant_order_id) ||
      payload && payload.merchant_order_id ||
      (payload && payload.data && payload.data.attributes && payload.data.attributes.merchant_order_id) ||
      null
    );

    const paymentId = (
      (payload && payload.data && payload.data.object && payload.data.object.id) ||
      (payload && payload.data && payload.data.id) ||
      payload && payload.id ||
      null
    );

    if (!merchantOrderId) {
      console.error('Tap webhook: merchant_order_id not found in payload', JSON.stringify(payload).slice(0, 500));
      return res.status(400).send('missing merchant_order_id');
    }

    const order = await loadOrder(String(merchantOrderId));
    if (!order) {
      console.warn('Tap webhook: order not found', merchantOrderId);
      // Respond 200 to avoid retries from gateway if you prefer, but return 404 to indicate missing mapping
      return res.status(404).send('order not found');
    }

    // Mark order as completed/confirmed
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paymentMethod = 'card';
    if (paymentId) order.paymentId = String(paymentId);
    order.updatedAt = new Date().toISOString();
    // store webhook payload snapshot for audit
    try {
      order.lastWebhook = { receivedAt: new Date().toISOString(), payload: payload };
    } catch (e) { /* ignore */ }

    await saveOrder(order);

    // Send confirmation email (best-effort)
    try {
      await sendOrderConfirmation(order);
    } catch (e) {
      console.error('Tap webhook: failed to send confirmation email', e && (e.message || e));
    }

    // Acknowledge
    return res.status(200).send('ok');
  } catch (err) {
    console.error('Tap webhook handler error:', err && (err.message || err));
    return res.status(500).send('server error');
  }
});

// Bank Transfer: Confirm transfer
app.post('/api/payments/bank-transfer/confirm', async (req, res) => {
  try {
    const { orderId, transferReference } = req.body;

    const order = await loadOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!transferReference) {
      return res.status(400).json({ error: 'Transfer reference is required' });
    }

    // Update order - mark as pending verification
    order.paymentStatus = 'pending_verification';
    order.orderStatus = 'confirmed';
    order.bankTransferReference = transferReference;
    order.paymentMethod = 'bank';
    order.updatedAt = new Date().toISOString();

    await saveOrder(order);

    // Send notification email to customer
    await sendOrderConfirmation(order);

    res.json({
      success: true,
      message: 'Bank transfer reference received. We will verify the payment and confirm your order.',
      order,
    });
  } catch (error) {
    console.error('Error confirming bank transfer:', error);
    res.status(500).json({ error: 'Failed to confirm transfer' });
  }
});

// Cash on Delivery: Confirm order
app.post('/api/payments/cash-on-delivery/confirm', async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await loadOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order - ready for delivery
    order.paymentStatus = 'pending_on_delivery';
    order.orderStatus = 'confirmed';
    order.paymentMethod = 'cash';
    order.updatedAt = new Date().toISOString();

    await saveOrder(order);

    // Send confirmation email
    await sendOrderConfirmation(order);

    res.json({
      success: true,
      message: 'Order confirmed. Payment will be collected upon delivery.',
      order,
    });
  } catch (error) {
    console.error('Error confirming cash on delivery:', error);
    res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Development-only debug endpoint to inspect environment loading
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/env', (req, res) => {
    try {
      const present = !!process.env.TAP_SECRET_KEY;
      return res.json({ TAP_SECRET_KEY_present: present, NODE_ENV: process.env.NODE_ENV || null, cwd: process.cwd() });
    } catch (e) {
      return res.status(500).json({ error: 'debug failed', details: String(e && e.message) });
    }
  });
}

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Try to connect to MongoDB (external). If it fails, fallback to file-based DB.
    try {
      await connectDB();
      console.log('✓ Connected to MongoDB (external or in-memory)');
    } catch (dbErr) {
      console.warn('⚠️ Database connection failed, switching to file-based storage:', dbErr && dbErr.message ? dbErr.message : dbErr);
      useFileDb = true;
      ensureOrdersDir();
    }

    app.listen(PORT, () => {
      console.log(`✓ QuickMart Backend Server running on http://localhost:${PORT}`);
      if (useFileDb) {
        console.log('⚠️ Using file-based storage for orders (development fallback)');
      } else {
        console.log('✓ Database ready');
      }
      console.log(`📧 Make sure to configure .env file with your payment credentials`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
