/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qdqgkmgfjhffc4cy.public.blob.vercel-storage.com', // <-- paste yours
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
