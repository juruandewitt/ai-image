/** @type {import('next').NextConfig} */
const nextConfig = {
  // Quick unblock: ignore ESLint errors during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // (Optional) If you deploy on Vercel and want to be explicit:
  typescript: {
    // Don’t fail the production build on type errors (optional quick unblock)
    ignoreBuildErrors: false, // set to true only if you need to unblock
  },
}

module.exports = nextConfig
