// app/sitemap/route.ts
import { NextResponse } from "next/server";


const SITE_URL_RAW = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://newaribhattiandkathmandumomoghar.com";
const SUPABASE_URL_RAW =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.SUPABASE_URL; // fallback
const POSSIBLE_KEYS = [
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.SUPABASE_SERVICE_KEY,
  process.env.SUPABASE_ANON_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
];

const SUPABASE_TABLE = process.env.SUPABASE_TABLE || "menu_items";
const SUPABASE_CATEGORIES_TABLE = process.env.SUPABASE_CATEGORIES_TABLE || "menu_categories";

function normalizeEnv(v: string | undefined) {
  if (!v) return "";
  // remove surrounding quotes and whitespace
  return v.trim().replace(/^['"]+|['"]+$/g, "");
}

const SITE_URL = normalizeEnv(SITE_URL_RAW);
const SUPABASE_URL = normalizeEnv(SUPABASE_URL_RAW);
const SUPABASE_KEY = normalizeEnv(POSSIBLE_KEYS.find(Boolean) || "");

function esc(s: any) {
  if (s === undefined || s === null) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isoDate(d: string | Date | undefined) {
  try {
    if (!d) return new Date().toISOString().slice(0, 10);
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return new Date().toISOString().slice(0, 10);
    return dt.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY || "",
      Authorization: SUPABASE_KEY ? `Bearer ${SUPABASE_KEY}` : "",
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function GET() {
  // If we can't find a usable Supabase URL/key, return fallback sitemap (home only).
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${esc(SITE_URL)}</loc>
    <lastmod>${isoDate(undefined)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </url>
</urlset>`;
    return new NextResponse(fallback, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }

  try {
    // Build Supabase REST URLs (requests common columns; adjust if your schema differs)
    const selectItemCols = encodeURIComponent("id,slug,name,created_at,updated_at,icon,image,image_url,photo,price,is_active");
    // fetch active items only
    const itemsUrl = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=${selectItemCols}&is_active=eq.true&limit=10000`;

    const selectCatCols = encodeURIComponent("id,slug,name,created_at,updated_at,icon,is_active");
    const catsUrl = `${SUPABASE_URL}/rest/v1/${SUPABASE_CATEGORIES_TABLE}?select=${selectCatCols}&is_active=eq.true&limit=10000`;

    const [items, categories] = await Promise.all([fetchJson(itemsUrl), fetchJson(catsUrl)]);

    const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    const staticUrls = [
      { loc: `${SITE_URL}/`, lastmod: new Date().toISOString().slice(0, 10), changefreq: "daily", priority: "1.00" },
      { loc: `${SITE_URL}/menu`, lastmod: new Date().toISOString().slice(0, 10), changefreq: "daily", priority: "0.90" },
      { loc: `${SITE_URL}/contact`, lastmod: new Date().toISOString().slice(0, 10), changefreq: "monthly", priority: "0.70" },
    ];

    const xmlParts: string[] = [];
    xmlParts.push(header);

    for (const u of staticUrls) {
      xmlParts.push(
        `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${esc(u.lastmod)}</lastmod>
    <changefreq>${esc(u.changefreq)}</changefreq>
    <priority>${esc(u.priority)}</priority>
  </url>`
      );
    }

    // items
    if (Array.isArray(items)) {
      for (const it of items) {
        const slug =
          it.slug ||
          it.id ||
          (it.name ? String(it.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "item");

        const itemUrl = `${SITE_URL.replace(/\/$/, "")}/menu/${encodeURIComponent(String(slug))}`;

        const imageCandidates = [it.image, it.image_url, it.photo, it.icon, it.picture, it.img, it.image_src];
        const image = imageCandidates.find((x) => x && typeof x === "string");

        const lastmod = isoDate(it.updated_at || it.created_at || undefined);

        let urlBlock = `  <url>
    <loc>${esc(itemUrl)}</loc>
    <lastmod>${esc(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>`;

        if (image) {
          urlBlock += `
    <image:image>
      <image:loc>${esc(image)}</image:loc>
      <image:caption>${esc(it.name || "")}</image:caption>
      <image:title>${esc(it.name || "")}</image:title>
    </image:image>`;
        }

        urlBlock += `
  </url>`;

        xmlParts.push(urlBlock);
      }
    }

    // categories
    if (Array.isArray(categories)) {
      for (const c of categories) {
        const slug =
          c.slug ||
          c.id ||
          (c.name ? String(c.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "category");

        const catUrl = `${SITE_URL.replace(/\/$/, "")}/menu/category/${encodeURIComponent(String(slug))}`;

        const imageCandidates = [c.icon, c.image, c.image_url, c.photo, c.picture];
        const image = imageCandidates.find((x) => x && typeof x === "string");

        const lastmod = isoDate(c.updated_at || c.created_at || undefined);

        let urlBlock = `  <url>
    <loc>${esc(catUrl)}</loc>
    <lastmod>${esc(lastmod)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>`;

        if (image) {
          urlBlock += `
    <image:image>
      <image:loc>${esc(image)}</image:loc>
      <image:caption>${esc(c.name || "")}</image:caption>
      <image:title>${esc(c.name || "")}</image:title>
    </image:image>`;
        }

        urlBlock += `
  </url>`;

        xmlParts.push(urlBlock);
      }
    }

    xmlParts.push("</urlset>");
    const xml = xmlParts.join("\n");

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    console.error("sitemap error:", err);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${esc(SITE_URL)}</loc>
    <lastmod>${isoDate(undefined)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </url>
</urlset>`;
    return new NextResponse(fallback, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
