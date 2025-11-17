
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export async function GET() {
  try {
    const { OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    // lightweight call to verify auth
    const models = await client.models.list()
    return NextResponse.json({ ok: true, count: models.data?.length ?? 0 })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
