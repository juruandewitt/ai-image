import { NextResponse } from "next/server";
import OpenAI from "openai";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
  const theme = "health-wellness";

  const prompts = [
    { title: "Sunrise Yoga Terrace - Health Wellness Theme", prompt: "Sunrise yoga terrace overlooking ocean, soft golden light, minimal luxury wellness aesthetic, ultra realistic, 8k" },
    { title: "Luxury Hydrotherapy Pool - Health Wellness Theme", prompt: "Luxury hydrotherapy pool with steam and natural stone, calm spa atmosphere, cinematic lighting, ultra realistic" },
    { title: "Minimalist Meditation Corner - Health Wellness Theme", prompt: "Minimalist meditation corner with floor cushions, neutral tones, soft sunlight, peaceful wellness interior, high detail" },
    { title: "Organic Skincare Still Life - Health Wellness Theme", prompt: "Organic skincare still life with glass bottles, natural textures, soft shadows, premium wellness branding aesthetic" },
    { title: "Wellness Journaling Scene - Health Wellness Theme", prompt: "Calm wellness journaling scene, linen textures, tea cup, morning light, mindfulness concept, ultra realistic" },
    { title: "Herbal Bath Salts Ritual - Health Wellness Theme", prompt: "Herbal bath salts and flowers in ceramic bowl, spa composition, soft lighting, macro detail, luxury wellness style" },
    { title: "Fitness Recovery Room - Health Wellness Theme", prompt: "Modern fitness recovery room with foam rollers and stretch area, clean minimal design, natural lighting" },
    { title: "Wellness Tea Garden - Health Wellness Theme", prompt: "Wellness tea garden with lush greenery and wooden table, tranquil atmosphere, cinematic depth, ultra realistic" },
    { title: "Soft Spa Bedroom - Health Wellness Theme", prompt: "Soft spa bedroom with neutral palette, linen bedding, diffused sunlight, calm luxury wellness interior" },
    { title: "Zen Water Fountain - Health Wellness Theme", prompt: "Zen water fountain with stones and bamboo, peaceful garden setting, shallow depth of field, ultra realistic" }
  ];

  const results = [];

  for (const item of prompts) {
    try {
      const image = await openai.images.generate({
        model: "gpt-image-1",
        prompt: item.prompt,
        size: "1024x1024"
      });

      const base64 = image.data[0].b64_json;
      const buffer = Buffer.from(base64, "base64");

      const fileName = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

      const blob = await put(
        `artworks/themes/${theme}/${fileName}`,
        buffer,
        { access: "public" }
      );

      const artwork = await prisma.artwork.create({
        data: {
          title: item.title,
          theme,
          imageUrl: blob.url
        }
      });

      results.push({
        title: item.title,
        success: true,
        artworkId: artwork.id,
        imageUrl: blob.url
      });

    } catch (error) {
      results.push({
        title: item.title,
        success: false
      });
    }
  }

  return NextResponse.json({
    message: "Health Wellness batch 3 complete",
    theme,
    count: results.length,
    results
  });
}
