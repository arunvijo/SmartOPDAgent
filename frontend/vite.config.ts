// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import the Tailwind CSS Vite plugin
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the Tailwind CSS plugin here
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 alias setup
    },
  },
})