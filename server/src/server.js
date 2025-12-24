import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Import MongoDB connection and models
import { connectDB } from './config/database.js';
import Product from './models/Product.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// --- 1. CRITICAL ENV VAR HANDLING ---
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (process.env.NODE_ENV === 'production' && !ADMIN_API_KEY) {
    console.error('FATAL: ADMIN_API_KEY missing in production.');
    process.exit(1);
}

// --- 2. SECURITY (Fixed CSP for Fonts/Images) ---
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "*"] 
        },
    },
}));

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// --- 3. CORS & MIDDLEWARE ---
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

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Ensure directories exist
['uploads/avatars', 'uploads/products'].forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// --- 4. ROUTES ---

// Fix "Cannot GET /" - Health Check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'Server is running', mode: process.env.NODE_ENV });
});

app.post('/api/admin/login', (req, res) => {
    const { key } = req.body;
    if (key !== ADMIN_API_KEY) return res.status(401).json({ error: 'Invalid key' });
    
    res.cookie('admin_session', key, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ success: true });
});

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

// --- 5. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server live on port ${PORT}`);
});