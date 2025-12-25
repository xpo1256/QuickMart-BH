import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // React and Tailwind plugins are required
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Use the live URL if it exists, otherwise localhost
        // VITE_API_URL should be an origin (no trailing /api). Default to local backend.
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    // Allow Render's hostname so `vite preview` accepts the incoming host header
    allowedHosts: ['quickmart-bh.onrender.com'],
    host: true,
  },
  base: './', // 👈 important for production so assets resolve correctly
})
