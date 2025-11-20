import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const need = ['OPENAI_API_KEY','BLOB_READ_WRITE_TOKEN']
    const env = Object.fromEntries(need.map(k => [k, process.env[k] ? 'OK' : 'MISSING']))
    const totalArt = await prisma.artwork.count()
    const withAssets = await prisma.artwork.count({ where: { assets: { some: {} } } })
    return NextResponse.json({ ok:true, env, totalArt, withAssets })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e) }, { status: 500 })
  }
}
