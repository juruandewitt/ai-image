/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    // Optionally allow inline data: URIs if you ever use them
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
