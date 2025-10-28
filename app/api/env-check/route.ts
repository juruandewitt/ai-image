import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET(request: Request) {
  const url = new URL(request.url)
  return NextResponse.json({
    siteUrlFromEnvHelper: env.SITE_URL,
    hostFromRequest: url.host,
    nextPublicSiteUrlVar: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    vercelUrlVar: process.env.VERCEL_URL ?? null,
  })
}
