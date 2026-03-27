'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // =========================
  // 1–50 ORIGINAL CARAVAGGIO WORKS
  // =========================
  { title: "Boy in Candlelight", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of a young boy lit by candlelight, dramatic chiaroscuro, dark background, baroque realism, rich oil painting detail" },
  { title: "Still Life with Fruit and Knife", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with fruit and knife on dark table, dramatic side light, deep shadows, baroque realism" },
  { title: "The Red Cloak Figure", style: "CARAVAGGIO", prompt: "Caravaggio inspired standing figure in a red cloak, intense chiaroscuro, theatrical realism, dark background" },
  { title: "Woman with Bowl of Grapes", style: "CARAVAGGIO", prompt: "Caravaggio inspired woman holding a bowl of grapes, strong directional light, deep shadow, rich baroque realism" },
  { title: "Young Musician in Shadow", style: "CARAVAGGIO", prompt: "Caravaggio inspired young musician in partial shadow, dramatic light on face and hands, baroque realism" },
  { title: "The Golden Apple Table", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with apples on dark table, golden highlights, dramatic chiaroscuro, realistic texture" },
  { title: "Man with Feathered Hat", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of a man wearing a feathered hat, strong light on face, dark moody background, oil realism" },
  { title: "The Candle and the Book", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with candle and old book, warm light, deep shadows, baroque atmosphere" },
  { title: "Woman Looking Down", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of woman looking downward, dramatic light on face, dark background, emotional realism" },
  { title: "The Quiet Supper Table", style: "CARAVAGGIO", prompt: "Caravaggio inspired candlelit supper table with bread and cup, rich shadows, baroque detail, solemn mood" },

  { title: "The Street Boy Portrait", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of a street boy, realistic face, sharp side lighting, dark baroque background" },
  { title: "Still Life with Pomegranate", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with pomegranate and cloth, dramatic lighting, realistic fruit texture, deep shadows" },
  { title: "The Noble Hand Gesture", style: "CARAVAGGIO", prompt: "Caravaggio inspired half-length figure with expressive hand gesture, intense light, dark background, baroque realism" },
  { title: "Young Woman with White Sleeve", style: "CARAVAGGIO", prompt: "Caravaggio inspired young woman wearing white sleeve, luminous skin, deep shadow, dramatic realism" },
  { title: "The Dark Table Scene", style: "CARAVAGGIO", prompt: "Caravaggio inspired table scene in darkness, single strong light source, realistic baroque still life" },
  { title: "Man with Brass Cup", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of man holding brass cup, rich shadow, warm highlight, theatrical realism" },
  { title: "The Knife and Pears", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with knife and pears, dramatic contrast, dark baroque setting" },
  { title: "Woman with Folded Hands", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of woman with folded hands, solemn expression, strong side light, deep shadow" },
  { title: "The Amber Bottle", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with amber bottle and fruit, rich light and shadow, realistic glass reflections" },
  { title: "The Narrow Beam of Light", style: "CARAVAGGIO", prompt: "Caravaggio inspired figure illuminated by narrow beam of light in dark room, dramatic realism" },

  { title: "The Baroque Corner", style: "CARAVAGGIO", prompt: "Caravaggio inspired dim interior corner with table and cloth, strong light from one side, moody realism" },
  { title: "Portrait with Dark Ribbon", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait with dark ribbon and luminous face, strong contrast, oil realism" },
  { title: "Still Life with Bread and Fig", style: "CARAVAGGIO", prompt: "Caravaggio inspired bread and fig still life, dark setting, golden highlights, detailed baroque realism" },
  { title: "The Watchful Gaze", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait with intense watchful gaze, strong cheekbone light, deep black background" },
  { title: "The Copper Plate", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with copper plate and fruit, strong reflected light, dramatic shadow" },
  { title: "Woman with Blue Scarf", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of woman with blue scarf, baroque realism, theatrical light, dark background" },
  { title: "The Shadowed Violin", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with violin in shadow, dramatic spotlight, rich wood texture" },
  { title: "The Silent Figure", style: "CARAVAGGIO", prompt: "Caravaggio inspired solitary figure in darkness, strong directional light, emotional realism" },
  { title: "Still Life with Wine Jug", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with wine jug, cup and fruit, rich chiaroscuro, realistic texture" },
  { title: "Man in Brown Velvet", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of man in brown velvet, warm light on face, dark surrounding shadow" },

  { title: "The Open Hand", style: "CARAVAGGIO", prompt: "Caravaggio inspired figure with open hand gesture, dramatic spotlight, dark baroque space" },
  { title: "The Rich Cloth Study", style: "CARAVAGGIO", prompt: "Caravaggio inspired draped cloth study under strong side light, deep folds, rich realism" },
  { title: "Portrait in Warm Shadow", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait emerging from warm shadow, strong face light, baroque realism" },
  { title: "The Old Cupboard", style: "CARAVAGGIO", prompt: "Caravaggio inspired old cupboard interior with vessel and fruit, dramatic single light source" },
  { title: "Woman with Gold Earring", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of woman with gold earring, intense shadow and luminous skin tone" },
  { title: "Still Life with Onion and Bread", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with onion and bread, earthy realism, strong chiaroscuro" },
  { title: "The Turned Face", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait with face turned into light, black background, emotional realism" },
  { title: "The Dark Music Room", style: "CARAVAGGIO", prompt: "Caravaggio inspired dim music room with instrument and table, dramatic lighting, baroque realism" },
  { title: "Man with Black Gloves", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of man with black gloves, intense side lighting, baroque darkness" },
  { title: "Still Life with Lemons", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with lemons on a dark table, strong light, rich texture, deep shadow" },

  { title: "The Solemn Youth", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of solemn youth, dramatic chiaroscuro, realistic skin, dark background" },
  { title: "The Heavy Curtain", style: "CARAVAGGIO", prompt: "Caravaggio inspired scene with heavy curtain and single lit figure, theatrical baroque atmosphere" },
  { title: "Woman with Glass Flask", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of woman with glass flask, precise reflections, strong side light" },
  { title: "The Table in Darkness", style: "CARAVAGGIO", prompt: "Caravaggio inspired dark table still life with spotlight effect, baroque realism" },
  { title: "Portrait with Burnished Gold", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait with burnished gold fabric, intense shadow and warm highlight" },
  { title: "The Quiet Apple", style: "CARAVAGGIO", prompt: "Caravaggio inspired single apple in dramatic light on dark table, symbolic stillness, oil realism" },
  { title: "The Half-Lit Face", style: "CARAVAGGIO", prompt: "Caravaggio inspired half-lit face portrait, black background, expressive realism" },
  { title: "Still Life with Knife and Cup", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life with knife and cup, warm highlights, deep baroque shadow" },
  { title: "The Deep Red Sleeve", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait featuring deep red sleeve, dramatic contrast, painterly realism" },
  { title: "The Last Candle", style: "CARAVAGGIO", prompt: "Caravaggio inspired final candle burning in a dark room, dramatic flame light, realistic baroque mood" },

  // =========================
  // 51–100 REINTERPRETATIONS
  // =========================
  { title: "Soft Smile in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired reinterpretation of a softly smiling woman, strong chiaroscuro, dark background, baroque realism" },
  { title: "Historic Dinner in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired reinterpretation of historic dinner scene, dramatic candlelight, deep shadows, realistic faces" },
  { title: "Pearl Portrait in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait of a young woman with pearl earring, intense side light, dark baroque background" },
  { title: "Dream Night Sky in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired night sky scene with baroque darkness and subtle heavenly glow, dramatic realism" },
  { title: "Mythic Shore in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired mythic shore scene, intense contrast light, dramatic realism, dark sea atmosphere" },
  { title: "Melting Time in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired symbolic time scene, dark baroque room, dramatic spotlight on surreal objects" },
  { title: "Rural Couple in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired rural couple portrait, intense side lighting, expressive realism, deep shadow" },
  { title: "Emotional Figure in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired expressive figure in darkness, dramatic spotlight, realistic baroque emotion" },
  { title: "Heavenly Light in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired heavenly light breaking into a dark interior, rich chiaroscuro, baroque realism" },
  { title: "Abstract Conflict in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired symbolic conflict scene, dramatic shadows, concentrated light, dark emotional realism" },

  { title: "Sunflower Table in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired still life of sunflowers on dark table, strong directional light, rich baroque texture" },
  { title: "Blue Horse in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired dramatic horse portrait in darkness, selective lighting, realistic baroque mood" },
  { title: "The Thinker in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired thoughtful seated figure, spotlight on face and hands, deep shadow, realism" },
  { title: "Great Wave in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired storm wave under dark sky, theatrical light, realistic dramatic sea" },
  { title: "Golden Embrace in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired embrace scene in candlelight, warm gold highlights, strong baroque shadow" },
  { title: "City Rain in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired rainy city scene at night, dramatic street light, deep shadows, realistic mood" },
  { title: "Cathedral Light in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired cathedral interior with powerful shaft of light, dark atmosphere, baroque realism" },
  { title: "Dancers in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired dancers caught in dramatic light, baroque movement, deep shadows, realism" },
  { title: "Open Window in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired dark room with open window and strong side light, baroque contrast, realism" },
  { title: "Cafe Night in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired candlelit night cafe, realistic faces, warm highlights, deep shadows" },

  { title: "Mother and Child in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired mother and child in candlelight, rich shadow, emotional baroque realism" },
  { title: "Garden Statues in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired statues in a dark garden with dramatic light, baroque atmosphere" },
  { title: "Quiet Harbor in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired harbor at night with intense reflections and dark dramatic mood" },
  { title: "The Musician in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired musician portrait in strong side light, dark setting, rich realism" },
  { title: "Ancient Ruins in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired ancient ruins illuminated by dramatic baroque light, deep shadow, realistic detail" },
  { title: "Festival Lights in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired evening festival lit by lanterns, strong contrast, rich shadow, realistic baroque atmosphere" },
  { title: "Rose Balcony in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired balcony with roses under dramatic light, dark background, realistic richness" },
  { title: "The Reader in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired reader in darkness with a strong light source, expressive realism" },
  { title: "Moonlit Bridge in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired bridge under moonlight, deep darkness, focused highlights, baroque realism" },
  { title: "Mountain View in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired mountain landscape with dramatic sky and spotlighted foreground, intense realism" },

  { title: "Seaside Portrait in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired portrait near the sea, dark dramatic sky, strong side light, realistic baroque mood" },
  { title: "The Blue Room in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired blue-toned room with strong directional light, dark contrast, baroque realism" },
  { title: "Harvest Workers in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired harvest workers in dramatic sunset light, deep shadows, realistic baroque earth tones" },
  { title: "Royal Garden in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired royal garden scene with intense shadow and concentrated golden light" },
  { title: "Stormy Sea in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired stormy sea with high contrast lighting, dark atmosphere, dramatic realism" },
  { title: "Autumn Portrait in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired autumn portrait with warm brown and gold tones, strong chiaroscuro" },
  { title: "The Marble Garden in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired marble garden with baroque shadows, dramatic light, realistic detail" },
  { title: "Wheat Field in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired wheat field under dark storm light, golden highlights, dramatic realism" },
  { title: "Soft Procession in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired ceremonial procession lit by torches, deep shadow, realistic baroque drama" },
  { title: "Window of Flowers in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired flowers by a dark window, dramatic side light, rich oil realism" },

  { title: "Palace Courtyard in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired palace courtyard at dusk, concentrated light, dark background, baroque realism" },
  { title: "The Poet in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired poet portrait in shadow, lit by a single warm light source, realistic detail" },
  { title: "Theater Evening in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired evening theater with torchlight and shadowy audience, baroque atmosphere" },
  { title: "Canal View in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired canal at twilight with strong reflected light and deep darkness" },
  { title: "Garden Tea in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired tea setting in dramatic outdoor light, dark background, realistic baroque stillness" },
  { title: "Quiet Library in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired library interior with one strong light source, dark wood, baroque realism" },
  { title: "The Standing Muse in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired standing muse in dramatic chiaroscuro, dark background, rich realism" },
  { title: "Harbor Lanterns in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired harbor at night with lantern light, strong reflections, deep darkness" },
  { title: "Classical Orchard in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired orchard scene with dramatic side light, rich shadows, realistic fruit and leaves" },
  { title: "Ancient Balcony in Caravaggio Style", style: "CARAVAGGIO", prompt: "Caravaggio inspired balcony overlooking old city at dusk, baroque contrast, realistic architectural detail" },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestCaravaggioFullPage() {
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>({})
  const [messages, setMessages] = useState<Record<number, string>>({})
  const [runningAll, setRunningAll] = useState(false)

  const counts = useMemo(() => {
    let idle = 0
    let running = 0
    let success = 0
    let error = 0

    for (let i = 0; i < ITEMS.length; i++) {
      const s = statuses[i] || 'idle'
      if (s === 'idle') idle++
      if (s === 'running') running++
      if (s === 'success') success++
      if (s === 'error') error++
    }

    return { idle, running, success, error }
  }, [statuses])

  async function generateOne(item: Item, index: number) {
    setStatuses((prev) => ({ ...prev, [index]: 'running' }))
    setMessages((prev) => ({ ...prev, [index]: 'Generating...' }))

    try {
      const url = new URL('/api/generate/master', window.location.origin)
      url.searchParams.set('title', item.title)
      url.searchParams.set('style', item.style)
      url.searchParams.set('prompt', item.prompt)

      const res = await fetch(url.toString(), {
        method: 'GET',
      })

      const text = await res.text()

      if (!res.ok) {
        setStatuses((prev) => ({ ...prev, [index]: 'error' }))
        setMessages((prev) => ({
          ...prev,
          [index]: `Error ${res.status}${text ? `: ${text.slice(0, 180)}` : ''}`,
        }))
        return
      }

      setStatuses((prev) => ({ ...prev, [index]: 'success' }))
      setMessages((prev) => ({ ...prev, [index]: 'Done' }))
    } catch (err) {
      setStatuses((prev) => ({ ...prev, [index]: 'error' }))
      setMessages((prev) => ({
        ...prev,
        [index]: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }

  async function generateAll() {
    setRunningAll(true)
    try {
      for (let i = 0; i < ITEMS.length; i++) {
        const current = statuses[i]
        if (current === 'success') continue
        await generateOne(ITEMS[i], i)
      }
    } finally {
      setRunningAll(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Generate Full Caravaggio Set</h1>
        <p className="text-slate-400 text-sm">
          100 Caravaggio artworks: 50 originals + 50 reinterpretations.
        </p>
        <div className="text-sm text-slate-300">
          Success: {counts.success} • Running: {counts.running} • Errors: {counts.error} • Idle: {counts.idle}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={generateAll}
          disabled={runningAll}
          className="rounded-lg bg-amber-500 px-4 py-2 text-black font-medium disabled:opacity-60"
        >
          {runningAll ? 'Generating...' : 'Generate All 100'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ITEMS.map((item, index) => {
          const status = statuses[index] || 'idle'
          const message = messages[index] || ''

          return (
            <div
              key={`${item.style}-${item.title}`}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3"
            >
              <div>
                <div className="text-sm text-slate-400">{item.style}</div>
                <div className="text-base font-medium text-slate-100">{item.title}</div>
                <div className="text-xs text-slate-500 mt-1">{item.prompt}</div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div
                  className={[
                    'text-xs px-2 py-1 rounded-full border',
                    status === 'idle' && 'border-slate-700 text-slate-400',
                    status === 'running' && 'border-amber-500 text-amber-300',
                    status === 'success' && 'border-emerald-500 text-emerald-300',
                    status === 'error' && 'border-red-500 text-red-300',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {status.toUpperCase()}
                </div>

                <button
                  type="button"
                  disabled={status === 'running' || runningAll}
                  onClick={() => generateOne(item, index)}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-amber-400 disabled:opacity-60"
                >
                  Generate this one
                </button>
              </div>

              {message ? (
                <div className="text-xs text-slate-400 break-words">{message}</div>
              ) : null}
            </div>
          )
        })}
      </div>
    </main>
  )
}
