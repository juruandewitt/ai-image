
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const present = !!(token && token.startsWith('vercel_blob_rw_'))

    // Try a write under the same prefix used by generator
    const obj = await put(`art/diag-${Date.now()}.txt`, new TextEncoder().encode('ok\n'), {
      access: 'public',
      contentType: 'text/plain',
      addRandomSuffix: false,
      token
    })

    return NextResponse.json({ ok: true, tokenPresent: present, wroteUrl: obj.url })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
