import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const MODEL = 'gpt-5.6-luna'
const MAX_BATCH_SIZE = 10

const PUBLIC_BLOB_PREFIX =
  'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/'

type AuditResult = {
  id: string
  title: string
  artist: string | null
  style: string | null
  thumbnail: string | null
  shouldReview: boolean
  severity: 'none' | 'low' | 'medium' | 'high'
  issueType:
    | 'none'
    | 'gibberish_text'
    | 'irrelevant_text'
    | 'inappropriate_wording'
    | 'fake_signage'
    | 'fake_signature'
    | 'watermark_like_text'
    | 'context_mismatch'
    | 'legitimate_text'
    | 'image_unavailable'
    | 'other'
  detectedText: string
  reason: string
  confidence: number
}

function extractOutputText(data: any): string {
  if (typeof data?.output_text === 'string') {
    return data.output_text
  }

  if (!Array.isArray(data?.output)) {
    return ''
  }

  const chunks: string[] = []

  for (const outputItem of data.output) {
    if (!Array.isArray(outputItem?.content)) continue

    for (const contentItem of outputItem.content) {
      if (
        contentItem?.type === 'output_text' &&
        typeof contentItem?.text === 'string'
      ) {
        chunks.push(contentItem.text)
      }
    }
  }

  return chunks.join('\n')
}

function cleanJsonText(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function safeConfidence(value: unknown) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return 0
  }

  return Math.max(0, Math.min(1, numberValue))
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing OPENAI_API_KEY',
        },
        {
          status: 500,
        }
      )
    }

    const body = await request.json().catch(() => ({}))

    const requestedOffset = Number(body?.offset ?? 0)
    const requestedLimit = Number(body?.limit ?? MAX_BATCH_SIZE)

    const offset = Number.isFinite(requestedOffset)
      ? Math.max(0, Math.floor(requestedOffset))
      : 0

    const limit = Number.isFinite(requestedLimit)
      ? Math.max(
          1,
          Math.min(MAX_BATCH_SIZE, Math.floor(requestedLimit))
        )
      : MAX_BATCH_SIZE

    const totalPublished = await prisma.artwork.count({
      where: {
        status: 'PUBLISHED',
      },
    })

    const artworks = await prisma.artwork.findMany({
      where: {
        status: 'PUBLISHED',
      },

      orderBy: [
        {
          createdAt: 'asc',
        },
        {
          id: 'asc',
        },
      ],

      skip: offset,
      take: limit,

      select: {
        id: true,
        title: true,
        artist: true,
        style: true,
        thumbnail: true,
        tags: true,
      },
    })

    if (artworks.length === 0) {
      return NextResponse.json({
        ok: true,
        offset,
        limit,
        totalPublished,
        scanned: 0,
        nextOffset: null,
        complete: true,
        results: [],
      })
    }

    /*
     * We only send permanent public Blob URLs to vision.
     *
     * Temporary OpenAI/Azure URLs may have expired.
     * Those records are automatically placed on the review list
     * instead of risking an entire vision batch failure.
     */
    const auditable = artworks.filter(
      (artwork) =>
        typeof artwork.thumbnail === 'string' &&
        artwork.thumbnail.startsWith(PUBLIC_BLOB_PREFIX)
    )

    const unavailable = artworks.filter(
      (artwork) =>
        !artwork.thumbnail ||
        !artwork.thumbnail.startsWith(PUBLIC_BLOB_PREFIX)
    )

    const unavailableResults: AuditResult[] = unavailable.map(
      (artwork) => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist ?? null,
        style: artwork.style ?? null,
        thumbnail: artwork.thumbnail ?? null,
        shouldReview: true,
        severity: 'medium',
        issueType: 'image_unavailable',
        detectedText: '',
        reason:
          'Artwork does not currently have a permanent public Vercel Blob thumbnail available for automated visual inspection.',
        confidence: 1,
      })
    )

    let visionResults: AuditResult[] = []

    if (auditable.length > 0) {
      const content: any[] = [
        {
          type: 'input_text',
          text: `
You are auditing a commercial digital-art marketplace before launch.

Your task is ONLY to identify unwanted, inappropriate, nonsensical, accidental, or contextually incorrect TEXT visible inside each artwork image.

Do not judge whether the artwork itself is beautiful.
Do not reject an image simply because it is unusual.
Do not flag normal artistic imperfections that are unrelated to text.

FLAG an artwork when it visibly contains things such as:

- gibberish lettering
- nonsense words
- malformed pseudo-writing
- random letters
- accidental captions
- generated text that has nothing to do with the artwork
- fake or nonsensical signage
- inappropriate or offensive wording
- modern wording that clearly does not belong in a historical scene
- watermark-like wording
- fake branding
- unwanted logos containing text
- large accidental typography
- fake signatures that look generated rather than intentional
- text that materially damages the artwork's commercial usefulness

DO NOT FLAG solely because an image contains legitimate contextual text, for example:

- a realistic street sign appropriate to the scene
- historically appropriate inscriptions
- intentional book/newspaper text where it naturally belongs
- numbers or labels that clearly make sense in context
- intentional typography when typography is obviously part of the requested artwork concept

When uncertain, prefer shouldReview=true with low or medium severity rather than falsely declaring the artwork acceptable.

For every supplied artwork, return exactly ONE result.

Return ONLY a valid JSON array.
Do not use markdown.
Do not use code fences.
Do not add commentary.

Each object must use exactly this structure:

{
  "id": "artwork id",
  "shouldReview": true,
  "severity": "none | low | medium | high",
  "issueType": "none | gibberish_text | irrelevant_text | inappropriate_wording | fake_signage | fake_signature | watermark_like_text | context_mismatch | legitimate_text | other",
  "detectedText": "brief transcription or description of visible problematic text, or empty string",
  "reason": "brief reason",
  "confidence": 0.0
}

confidence must be between 0 and 1.

If text is present but legitimate and appropriate:
- shouldReview = false
- severity = none
- issueType = legitimate_text

If no meaningful text is visible:
- shouldReview = false
- severity = none
- issueType = none
`.trim(),
        },
      ]

      for (const artwork of auditable) {
        content.push({
          type: 'input_text',
          text: `ARTWORK ID: ${artwork.id}
TITLE: ${artwork.title}
ARTIST: ${artwork.artist ?? 'Unknown'}
STYLE: ${artwork.style ?? 'Unknown'}
TAGS: ${(artwork.tags ?? []).join(', ')}`,
        })

        content.push({
          type: 'input_image',
          image_url: artwork.thumbnail,
        })
      }

      const response = await fetch(
        'https://api.openai.com/v1/responses',
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            model: MODEL,
            input: [
              {
                role: 'user',
                content,
              },
            ],
            max_output_tokens: 3000,
          }),

          cache: 'no-store',
        }
      )

      if (!response.ok) {
        const errorText = await response.text()

        return NextResponse.json(
          {
            ok: false,
            error: `OpenAI visual audit failed (${response.status}): ${errorText}`,
            offset,
            limit,
          },
          {
            status: 500,
          }
        )
      }

      const responseData = await response.json()

      const rawText = cleanJsonText(
        extractOutputText(responseData)
      )

      if (!rawText) {
        return NextResponse.json(
          {
            ok: false,
            error: 'OpenAI returned no audit text.',
            offset,
            limit,
          },
          {
            status: 500,
          }
        )
      }

      let parsed: any

      try {
        parsed = JSON.parse(rawText)
      } catch {
        return NextResponse.json(
          {
            ok: false,
            error: 'Could not parse visual-audit JSON.',
            rawText,
            offset,
            limit,
          },
          {
            status: 500,
          }
        )
      }

      if (!Array.isArray(parsed)) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Visual audit did not return a JSON array.',
            rawText,
            offset,
            limit,
          },
          {
            status: 500,
          }
        )
      }

      visionResults = auditable.map((artwork) => {
        const match = parsed.find(
          (item: any) => item?.id === artwork.id
        )

        if (!match) {
          return {
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist ?? null,
            style: artwork.style ?? null,
            thumbnail: artwork.thumbnail ?? null,
            shouldReview: true,
            severity: 'medium',
            issueType: 'other',
            detectedText: '',
            reason:
              'Automated visual audit returned no result for this artwork.',
            confidence: 0,
          } satisfies AuditResult
        }

        const allowedSeverity = [
          'none',
          'low',
          'medium',
          'high',
        ]

        const allowedIssueTypes = [
          'none',
          'gibberish_text',
          'irrelevant_text',
          'inappropriate_wording',
          'fake_signage',
          'fake_signature',
          'watermark_like_text',
          'context_mismatch',
          'legitimate_text',
          'other',
        ]

        return {
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist ?? null,
          style: artwork.style ?? null,
          thumbnail: artwork.thumbnail ?? null,

          shouldReview: Boolean(match.shouldReview),

          severity: allowedSeverity.includes(match.severity)
            ? match.severity
            : 'medium',

          issueType: allowedIssueTypes.includes(match.issueType)
            ? match.issueType
            : 'other',

          detectedText:
            typeof match.detectedText === 'string'
              ? match.detectedText
              : '',

          reason:
            typeof match.reason === 'string'
              ? match.reason
              : 'No reason supplied.',

          confidence: safeConfidence(match.confidence),
        } satisfies AuditResult
      })
    }

    const results = [
      ...visionResults,
      ...unavailableResults,
    ].sort((a, b) => {
      const aIndex = artworks.findIndex(
        (artwork) => artwork.id === a.id
      )

      const bIndex = artworks.findIndex(
        (artwork) => artwork.id === b.id
      )

      return aIndex - bIndex
    })

    const nextOffset = offset + artworks.length

    return NextResponse.json({
      ok: true,

      model: MODEL,

      offset,
      limit,

      totalPublished,

      scanned: artworks.length,

      nextOffset:
        nextOffset >= totalPublished
          ? null
          : nextOffset,

      complete:
        nextOffset >= totalPublished,

      suspectsInBatch: results.filter(
        (result) => result.shouldReview
      ).length,

      results,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : 'Unknown artwork audit error',
      },
      {
        status: 500,
      }
    )
  }
}
