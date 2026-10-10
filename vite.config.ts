import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Split stable vendor code so app updates do not invalidate it in the PWA cache
          manualChunks(id) {
            if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            if (/node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
            if (/node_modules[\\/]lucide-react[\\/]/.test(id)) return 'icons';
            // Reference tables (WHO/CDC curves, KPSP, milestones) change rarely: own chunk, cached across app updates
            if (/[\\/]src[\\/]data[\\/](growthRef|kpsp|milestonesCdc|tdd|gpph|speech|sensory|pregnancy|babyNorms|autismSigns)\.ts$/.test(id)) return 'reference';
            return undefined;
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
