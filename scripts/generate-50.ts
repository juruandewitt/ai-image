
// scripts/generate-50.ts
import { MasterKey, makeTitles } from './subjects'

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
      console.error(`✖ ${style} – "${title}" → ${json?.error || res.statusText}`)
      return null
    }
    console.log(`✓ ${style} – "${title}" → ${json.url}`)
    return json.url as string
  } catch {
    console.error(`✖ ${style} – "${title}" → bad JSON:`, text.slice(0, 160))
    return null
  }
}

async function run() {
  const style = (process.argv[2] || '').toLowerCase() as MasterKey
  const count = Number(process.argv[3] || 50)
  const start = Number(process.argv[4] || 0)

  const valid: MasterKey[] = ['van-gogh','rembrandt','picasso','vermeer','monet','michelangelo','dali','caravaggio','da-vinci','pollock']
  if (!valid.includes(style)) {
    console.error('Usage: pnpm tsx scripts/generate-50.ts <master> [count=50] [start=0]')
    console.error('masters:', valid.join(', '))
    process.exit(1)
  }

  const titles = makeTitles(style, count + start).slice(start, start + count)
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
    await sleep(1500) // pacing to avoid timeouts/rate limits
  }

  console.log(`\nDone: ${ok}/${titles.length} created.`)
  console.log(`Visit ${SITE} → hard refresh (Cmd/Ctrl+Shift+R).`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
