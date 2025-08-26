// src/pages/robots.txt.ts
import type { APIRoute } from 'astro';
const domain = `https://griffinswebservices.com`; 

export const GET: APIRoute = () => {
  // Build your robots directives
  const lines = [
    'User-agent: *',
    'Allow: /',
    // `Sitemap: ${domain}/sitemap-0.xml`,
    `Host: ${domain}`,
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
};
