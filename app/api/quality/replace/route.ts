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
[
'Luxury Space Station Observatory',
'luxury orbital space station observatory overlooking distant galaxies and glowing nebulae',
],
[
'Galaxy Core Panorama',
'spectacular panoramic view of the galactic core filled with stars cosmic dust and radiant light',
],
[
'Nebula Dreamscape',
'vibrant colorful nebula clouds illuminated by distant stars in deep space',
],
[
'Astronaut Viewing Deck',
'futuristic astronaut viewing deck suspended above a breathtaking planetary horizon',
],
[
'Ringed Planet Sunrise',
'majestic ringed planet rising above a cosmic horizon with dramatic celestial lighting',
],
[
'Deep Space Exploration Vessel',
'advanced exploration spacecraft traveling through a field of stars and cosmic phenomena',
],
[
'Interstellar Gateway',
'massive futuristic gateway connecting distant regions of the galaxy with glowing energy',
],
[
'Moon Colony Skyline',
'luxury moon colony skyline illuminated beneath a star filled universe',
],
[
'Cosmic Observatory Dome',
'high technology observatory dome studying galaxies quasars and deep space mysteries',
],
[
'Celestial Horizon',
'epic celestial horizon featuring planets stars nebulae and infinite cosmic beauty',
],
].map(([name, description]) => ({
title: `${name} - Space Galaxy Theme`,
prompt: `premium space galaxy artwork, ${description}, ultra realistic, cinematic lighting, deep space atmosphere, highly detailed, luxury sci fi aesthetic, commercial wall art quality, breathtaking cosmic scenery, vibrant colors, award winning composition, no readable text, no logos, no watermark, no people`,
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
message: 'Space Galaxy batch 1 complete',
theme: THEME,
count: ITEMS.length,
results,
})
}
