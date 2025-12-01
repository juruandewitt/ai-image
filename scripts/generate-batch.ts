
// scripts/generate-batch.ts
import { MASTER_TITLES, MasterKey } from './masters'

const SITE = process.env.SITE_URL || 'https://ai-image-gallery-iota.vercel.app'
const ONE_ENDPOINT = `${SITE}/api/generate/one`

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function generateOne(style: MasterKey, title: string) {
  const url = `${ONE_ENDPOINT}?style=${encodeURIComponent(style)}&title=${encodeURIComponent(title)}`
  const res = await fetch(url, { method: 'GET' })
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    if (!res.ok || !json?.ok) {
      console.error(`✖ Failed: ${title} — ${json?.error || res.statusText}`)
      return null
    }
    console.log(`✓ Created: ${title} → ${json.url}`)
    return json.url as string
  } catch {
    console.error(`✖ Bad JSON for ${title}:`, text.slice(0, 160))
    return null
  }
}

async function run() {
  const style = (process.argv[2] || '').toLowerCase() as MasterKey
  const limitArg = parseInt(process.argv[3] || '', 10)
  const valid: MasterKey[] = ['van-gogh','rembrandt','picasso','vermeer','monet','michelangelo','dali','caravaggio','da-vinci','pollock']
  if (!valid.includes(style)) {
    console.error('Usage: pnpm tsx scripts/generate-batch.ts <master> [limit]')
    console.error('masters:', valid.join(', '))
    process.exit(1)
  }

  const titles = MASTER_TITLES[style].slice(0, isNaN(limitArg) ? MASTER_TITLES[style].length : limitArg)
  console.log(`\nGenerating ${titles.length} "${style}" artworks via ${ONE_ENDPOINT}\n`)

  let ok = 0
  for (const t of titles) {
    let url: string | null = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      url = await generateOne(style, t)
      if (url) break
      const delay = 2000 * attempt
      console.log(`… retrying in ${delay}ms`)
      await sleep(delay)
    }
    if (url) ok++
    await sleep(1200) // gentle pacing
  }

  console.log(`\nDone: ${ok}/${titles.length} created.\nVisit ${SITE} and hard-refresh (Cmd/Ctrl+Shift+R).`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
