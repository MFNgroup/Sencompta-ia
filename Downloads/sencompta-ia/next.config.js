// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Nécessaire pour que mysql2 fonctionne côté serveur sur Vercel
  serverExternalPackages: ['mysql2'],

  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
