import { NextResponse } from "next/server";
import OpenAI from "openai";
import { put } from "@vercel/blob";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
  const theme = "business-finance";

  const items = [
    "Executive Boardroom Night - Business Finance Theme",
    "Financial District Skyline - Business Finance Theme",
    "Luxury Banking Interior - Business Finance Theme",
    "Fintech Dashboard Concept - Business Finance Theme",
    "Stock Exchange Floor - Business Finance Theme",
    "Business Strategy Desk - Business Finance Theme",
    "Corporate Glass Atrium - Business Finance Theme",
    "Investment Portfolio Flatlay - Business Finance Theme",
    "Startup Pitch Room - Business Finance Theme",
    "Modern Accounting Workspace - Business Finance Theme",
  ];

  const results = [];

  for (const title of items) {
    try {
      const image = await openai.images.generate({
        model: "gpt-image-1",
        prompt: title,
        size: "1024x1024",
      });

      const base64 = image.data?.[0]?.b64_json;

      if (!base64) {
        throw new Error("No image returned");
      }

      const buffer = Buffer.from(base64, "base64");

      const fileName = `${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}.png`;

      const blob = await put(
        `artworks/themes/${theme}/${fileName}`,
        buffer,
        {
          access: "public",
        }
      );

      results.push({
        title,
        success: true,
        imageUrl: blob.url,
      });
    } catch (error) {
      results.push({
        title,
        success: false,
      });
    }
  }

  return NextResponse.json({
    message: "Business Finance batch 2 complete",
    theme,
    count: results.length,
    results,
  });
}
