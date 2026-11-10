import type { MetadataRoute } from "next";
import { allBands, allCharacters } from "@/lib/data";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/characters`, lastModified: new Date() },
    { url: `${baseUrl}/bands`, lastModified: new Date() },
    { url: `${baseUrl}/stories`, lastModified: new Date() },
    { url: `${baseUrl}/forum`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
  ];

  for (const band of allBands) {
    entries.push({ url: `${baseUrl}/bands/${band.id}`, lastModified: new Date() });
  }
  for (const character of allCharacters) {
    entries.push({
      url: `${baseUrl}/characters/${character.id}`,
      lastModified: new Date(),
    });
  }

  return entries;
}
