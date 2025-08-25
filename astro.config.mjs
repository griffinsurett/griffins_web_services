// astro.config.mjs - Performance optimized
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://griffinswebservices.com',
  server: {
    port: 9999,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom')
            ) {
              return 'react-vendor';
            }
            // Separate chunk for icon libraries
            if (id.includes('@iconify') || id.includes('astro-icon')) {
              return 'icons';
            }
            // Separate Lottie from main bundle 
            if (id.includes('lottie-web') || id.includes('Lotties/')) {
              return 'lottie';
            }
          },
        },
      },
    },
    optimizeDeps: {
      include: ['lottie-web'],
      // Don't pre-bundle lottie to allow dynamic importing
      exclude: ['lottie-web']
    },
    // Performance optimizations
    define: {
      // Reduce bundle size
      'process.env.NODE_ENV': '"production"'
    }
  },
  integrations: [
    mdx(),
    react({
      include: ['**/react/*', '**/components/**/*.jsx', '**/hooks/**/*.js']
    }),
    icon({
      include: {
        // Lucide icons (for UI elements)
        lucide: [
          'mail', 'phone', 'linkedin', 'twitter', 'github', 'instagram',
          'chevron-left', 'chevron-right', 'menu', 'x', 'star'
        ],
        
        // Simple Icons (for tech brands)
        'simple-icons': [
          'astro', 'nextdotjs', 'react', 'gatsby', 'svelte',
          'shopify', 'wordpress', 'elementor', 'webflow',
          'framer', 'vercel', 'github', 'nodedotjs'
        ],
        
        // Font Awesome brands (for missing tech brands)  
        'fa6-brands': [
          'aws', 'figma', 'cloudflare', 'php', 'python'
        ],
        
        // Font Awesome solid (if needed for UI)
        'fa6-solid': ['star', 'heart', 'check']
      },
      // Generate SVG sprite for better performance
      svgoOptions: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      },
    }),
  ],
  // Performance optimizations
  experimental: {
    contentCollectionCache: true,
  },
  // Prefetch configuration
  prefetch: {
    prefetchAll: false, // Only prefetch on hover/focus
    defaultStrategy: 'hover'
  }
});