import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import multer from 'multer';
import { uploadBufferToS3, saveBufferToLocal } from './services/storage.js';

// Import MongoDB connection and models
import { connectDB } from './config/database.js';
import Product from './models/Product.js';
import User from './models/User.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// Normalize FRONTEND_URL (strip trailing /api if accidentally set)
if (process.env.FRONTEND_URL) {
  const stripped = String(process.env.FRONTEND_URL).replace(/\/api\/?$/, '');
  if (stripped !== process.env.FRONTEND_URL) {
    console.warn('NOTICE: FRONTEND_URL had a trailing /api — stripping it for safety.');
    process.env.FRONTEND_URL = stripped;
  }
}

// --- 1. ENV VAR HANDLING ---
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (process.env.NODE_ENV === 'production' && !ADMIN_API_KEY) {
  console.error('FATAL: ADMIN_API_KEY missing.');
  process.exit(1);
}

// --- 2. SECURITY & MIDDLEWARE ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"]
    },
  },
}));

// Enforce HSTS in production
if ((process.env.NODE_ENV || 'development') === 'production') {
  app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }));
}

// Logging
app.use(morgan('combined'));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean).map(url => url.replace(/\/$/, ""));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

// Ensure directories exist
['storage/avatars', 'storage/products'].forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// --- 3. MIDDLEWARE GUARDS ---
const adminGuard = (req, res, next) => {
  const session = req.cookies.admin_session;
  if (session && session === ADMIN_API_KEY) {
    return next();
  }
  res.status(403).json({ error: 'Admin access denied' });
};

// --- 4. PUBLIC ROUTES ---
app.get('/', (req, res) => {
  res.status(200).json({ status: 'QuickMart API Live', mode: process.env.NODE_ENV });
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ error: 'Database Error' }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ error: 'Error fetching product' }); }
});

// --- 5. ADMIN ROUTES ---
app.post('/api/admin/login', (req, res) => {
  const { key } = req.body;
  if (key !== ADMIN_API_KEY) return res.status(401).json({ error: 'Invalid key' });

  res.cookie('admin_session', key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
  res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
  const session = req.cookies.admin_session;
  res.json({ ok: session === ADMIN_API_KEY });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_session', { secure: process.env.NODE_ENV === 'production', sameSite: 'none' });
  res.json({ success: true });
});

app.post('/api/admin/products', adminGuard, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

const memoryUpload = multer({ storage: multer.memoryStorage() });
app.post('/api/admin/products/upload', adminGuard, memoryUpload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const results = [];
    for (const f of req.files) {
      const filename = `${Date.now()}-${f.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      try {
        if (process.env.S3_BUCKET) {
          const url = await uploadBufferToS3(f.buffer, `products/${filename}`, f.mimetype);
          results.push({ url });
        } else {
          const url = saveBufferToLocal(f.buffer, filename, 'products');
          results.push({ url });
        }
      } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Upload failed' });
      }
    }
    res.json({ files: results });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/products/:id', adminGuard, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/admin/products/:id', adminGuard, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

// --- 6. AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email: email.toLowerCase() });
    if (!u || !(await bcrypt.compare(password, u.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: u._id, name: u.name }, JWT_SECRET, { expiresIn: '30d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    res.json({ success: true, user: { id: u._id, name: u.name, email: u.email } });
  } catch (err) { res.status(500).json({ error: 'Login failed' }); }
});

app.get('/api/auth/me', async (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json(null);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json(decoded);
  } catch (err) { res.status(401).json(null); }
});

// --- 7. STATIC FRONTEND SERVING ---
const PORT = process.env.PORT || 5000;
let distPath = path.join(process.cwd(), 'dist');
const altDist = path.join(process.cwd(), '..', 'dist');

// Fallback if dist is not in current working directory
if (!fs.existsSync(distPath) && fs.existsSync(altDist)) {
  distPath = altDist;
}

if (fs.existsSync(distPath)) {
  console.log('Serving static frontend from', distPath);
  app.use(express.static(distPath));

  // SPA fallback: serve index.html for non-API GET requests
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).end();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('No built frontend found at', distPath, 'or', altDist);
}

// --- 8. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- 9. START SERVER ---
app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server live on port ${PORT}`);
});
