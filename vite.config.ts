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
        target: process.env.VITE_API_URL || 'https://your-backend-api.onrender.com/api',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
