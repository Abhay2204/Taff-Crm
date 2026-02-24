import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // xlsx + lucide-react together push the single chunk over 500 kB.
    // Raise the warning limit to avoid false-positive build failures.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split vendor libraries into a separate chunk for caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
          xlsx: ['xlsx'],
        },
      },
    },
  },
})
