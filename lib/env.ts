export const env = {
  SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
}
