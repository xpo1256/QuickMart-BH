import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

// Fail fast if critical env vars are missing in production
if (process.env.NODE_ENV === 'production' && (!JWT_SECRET || !ADMIN_API_KEY)) {
    console.error('FATAL: JWT_SECRET or ADMIN_API_KEY missing in production.');
    process.exit(1);
}

// 1. SECURITY & LOGGING
app.use(helmet({ contentSecurityPolicy: false }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// 2. FIXED CORS (Crucial for Render login)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173'
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

// 3. STORAGE SETUP
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Ensure directories exist
['uploads/avatars', 'uploads/products'].forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// 4. AUTH MIDDLEWARES
const requireAuth = (req, res, next) => {
    const token = req.cookies?.auth_token;
    if (!token) return res.status(401).json({ error: 'Auth required' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) { res.status(401).json({ error: 'Invalid session' }); }
};

const requireAdminKey = (req, res, next) => {
    const providedCookie = req.cookies?.admin_session;
    const providedHeader = req.headers['x-admin-key'];
    if (providedCookie === ADMIN_API_KEY || providedHeader === ADMIN_API_KEY) return next();
    res.status(401).json({ error: 'Admin access required' });
};

// 5. ADMIN LOGIN (Cookie Fix)
app.post('/api/admin/login', (req, res) => {
    const { key } = req.body;
    if (key !== ADMIN_API_KEY) return res.status(401).json({ error: 'Invalid key' });
    
    res.cookie('admin_session', key, {
        httpOnly: true,
        secure: true, // Render uses HTTPS
        sameSite: 'none', // Needed because Frontend and Backend are different URLs
        maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ success: true });
});

// 6. CORE API ROUTES
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ error: 'DB Error' }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const u = await User.findOne({ email: email.toLowerCase() });
        if (!u || !(await bcrypt.compare(password, u.passwordHash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: u._id, name: u.name, email: u.email }, JWT_SECRET, { expiresIn: '30d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        res.json({ success: true, user: { id: u._id, name: u.name } });
    } catch (err) { res.status(500).json({ error: 'Login failed' }); }
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server live on port ${PORT}`);
});