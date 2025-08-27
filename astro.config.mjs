// astro.config.mjs
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import icon from 'astro-icon';

// Load environment variables from .env files
const env = loadEnv(
  process.env.NODE_ENV || 'development', 
  process.cwd(), 
  ''
);

// Get site domain with proper fallbacks for different environments
const getSiteUrl = () => {
  // First, try the loaded .env file variable
  let domain = env.PUBLIC_SITE_DOMAIN;
  
  // If not found in .env, try system environment (for production deployments)
  if (!domain) {
    domain = process.env.PUBLIC_SITE_DOMAIN;
  }
  
  // Fallback to default domain
  if (!domain) {
    domain = 'griffinswebservices.com';
  }
  
  // Always use https in production, http for localhost development
  const protocol = domain.includes('localhost') || domain.includes('127.0.0.1') 
    ? 'http' 
    : 'https';
    
  return `${protocol}://${domain}`;
};

const siteUrl = getSiteUrl();
console.log(`Site URL: ${siteUrl}`);

export default defineConfig({
  site: siteUrl,
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
          },
        },
      },
    },
    optimizeDeps: {
      include: ['lottie-web'],
    },
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
          'html5', 'css3', 'javascript', 'astro', 'nextdotjs', 
          'react', 'gatsby', 'svelte', 'shopify', 'wordpress', 
          'elementor', 'webflow', 'framer', 'vercel', 'github', 
          'nodedotjs'
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
});