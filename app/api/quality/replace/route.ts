import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'space-galaxy'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
['Cosmic Nebula Cathedral', 'massive celestial cathedral formed within glowing nebula clouds and cosmic light'],
['Twin Planet Horizon', 'spectacular horizon featuring twin planets rising above a distant alien landscape'],
['Galactic Research Station', 'advanced research station floating among stars studying deep space phenomena'],
['Starlight Observation Deck', 'luxury observation deck overlooking billions of stars and colorful galaxies'],
['Cosmic Rift Gateway', 'enormous energy gateway opening through a brilliant cosmic rift in deep space'],
['Orbital Luxury Colony', 'luxury orbital colony suspended above a beautiful blue planet'],
['Asteroid Belt Expedition', 'futuristic spacecraft navigating through a dramatic asteroid belt filled with light'],
['Galaxy Reflection Vista', 'stunning cosmic vista with galaxies reflected across a crystalline alien surface'],
['Deep Space Command Center', 'high technology command center monitoring interstellar travel routes'],
['Infinite Universe Panorama', 'epic panoramic view of endless galaxies nebulae stars and cosmic wonders'],
].map(([name, description]) => ({
title: `${name} - Space Galaxy Theme`,
prompt: `premium space galaxy digital artwork, ${description}, ultra realistic, cinematic lighting, deep space atmosphere, highly detailed, luxury sci fi aesthetic, commercial wall art quality, breathtaking cosmic scenery, vibrant colors, award winning composition, no readable text, no logos, no watermark, no people`,
}))

function safeFilePart(value: string) {
return value
.normalize('NFKD')
.replace(/[\u0300-\u036f]/g, '')
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-+|-+$/g, '')
.slice(0, 90)
}

async function generateOpenAiImageBuffer(prompt: string) {
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
throw new Error('Missing OPENAI_API_KEY')
}

const response = await fetch(
'https://api.openai.com/v1/images/generations',
{
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${apiKey}`,
},
body: JSON.stringify({
model: 'gpt-image-1',
prompt,
size: '1024x1024',
quality: 'medium',
n: 1,
}),
cache: 'no-store',
}
)

if (!response.ok) {
const text = await response.text()
throw new Error(
`OpenAI image generation failed (${response.status}): ${text}`
)
}

const data = await response.json()
const base64 = data?.data?.[0]?.b64_json

if (!base64) {
throw new Error('No image returned from OpenAI')
}

return Buffer.from(base64, 'base64')
}

async function uploadGeneratedImageToBlob(
imageBuffer: Buffer,
title: string
) {
const blob = await put(
`artworks/themes/${THEME}/${safeFilePart(title)}.png`,
imageBuffer,
{
access: 'public',
addRandomSuffix: true,
contentType: 'image/png',
}
)

return blob.url
}

async function upsertArtwork(
item: (typeof ITEMS)[number],
imageUrl: string
) {
const tags = [
THEME_TAG,
'space',
'galaxy',
'cosmos',
'astronomy',
'sci-fi',
'wall-art',
]

const existing = await prisma.artwork.findFirst({
where: {
title: item.title,
},
select: {
id: true,
},
})

const artwork = existing
? await prisma.artwork.update({
where: {
id: existing.id,
},
data: {
thumbnail: imageUrl,
artist: ARTIST,
tags,
status: 'PUBLISHED' as any,
},
select: {
id: true,
},
})
: await prisma.artwork.create({
data: {
title: item.title,
style: STYLE as any,
artist: ARTIST,
thumbnail: imageUrl,
tags,
status: 'PUBLISHED' as any,
price: 9.99,
},
select: {
id: true,
},
})

await prisma.asset.create({
data: {
artworkId: artwork.id,
originalUrl: imageUrl,
provider: 'openai-gpt-image-1',
prompt: item.prompt,
},
})

return artwork.id
}

export async function GET() {
const results = []

for (const item of ITEMS) {
try {
const imageBuffer = await generateOpenAiImageBuffer(item.prompt)

```
  const blobUrl = await uploadGeneratedImageToBlob(
    imageBuffer,
    item.title
  )

  const artworkId = await upsertArtwork(
    item,
    blobUrl
  )

  results.push({
    title: item.title,
    success: true,
    artworkId,
    imageUrl: blobUrl,
  })
} catch (err) {
  results.push({
    title: item.title,
    success: false,
    error:
      err instanceof Error
        ? err.message
        : 'Unknown error',
  })
}
```

}

return NextResponse.json({
message: 'Space Galaxy batch 2 complete',
theme: THEME,
count: ITEMS.length,
results,
})
}
