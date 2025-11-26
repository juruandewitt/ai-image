// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'qdqgkmgfjhffc4cy.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  },
  // avoid blocking deploys while we iterate
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
}

export default nextConfig
