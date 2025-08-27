// iconConfig.js
export const iconConfig = {
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
};