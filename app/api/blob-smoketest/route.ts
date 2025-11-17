
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const now = new Date().toISOString()
    const bytes = new TextEncoder().encode(`hello blob @ ${now}\n`)
    const obj = await put(`smoketest/${Date.now()}.txt`, bytes, {
      access: 'public',
      contentType: 'text/plain',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return NextResponse.json({ ok: true, url: obj.url })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
