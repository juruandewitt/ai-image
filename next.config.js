/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'picsum.photos' }, // keep if you still use placeholders
    ],
  },
}
module.exports = nextConfig
