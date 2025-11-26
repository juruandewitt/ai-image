/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  // Prevent old ESLint options from breaking your build on Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
