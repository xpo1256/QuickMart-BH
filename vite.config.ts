import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
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
})
