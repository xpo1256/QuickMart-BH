#!/usr/bin/env node
/**
 * Usage:
 *  node createProduct.js <product.json>
 * product.json can contain a single product object (fields: name, price, images, stock, etc.)
 */
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load server/.env so ADMIN_API_KEY is available when running this script
dotenv.config({ path: new URL('../.env', import.meta.url) });

const API_BASE = process.env.BACKEND_URL || 'http://localhost:5000';

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node createProduct.js <product.json>');
    process.exit(1);
  }

  try {
    const filePath = path.resolve(process.cwd(), arg);
    const content = await fs.readFile(filePath, 'utf-8');
    const payload = JSON.parse(content);

    const adminKey = process.env.ADMIN_API_KEY || process.env.BACKEND_ADMIN_KEY || '';
    const headers = { 'Content-Type': 'application/json' };
    if (adminKey) headers['x-admin-key'] = adminKey;

    const res = await fetch(`${API_BASE}/api/admin/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to create product:', res.status, text);
      process.exit(2);
    }

    const data = await res.json();
    console.log('Product created:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
    process.exit(3);
  }
}

main();
