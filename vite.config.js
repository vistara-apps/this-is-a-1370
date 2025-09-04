import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress circular dependency warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      }
    },
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  optimizeDeps: {
    include: ['lucide-react']
  },
  define: {
    global: 'globalThis'
  }
})
