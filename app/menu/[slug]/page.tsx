// app/menu/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

const SITE_URL = process.env.SITE_URL || "https://newaribhattiandkathmandumoghar.com";
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/^['"]|['"]$/g, "");
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").replace(/^['"]|['"]$/g, "");

// fetch the item via Supabase REST (server-side)
async function getMenuItemBySlug(slug: string) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const encoded = encodeURIComponent(`slug=eq.${slug}`);
  const url = `${SUPABASE_URL}/rest/v1/menu_items?select=*&${encoded}&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getMenuItemBySlug(params.slug);
  if (!item) return { title: "Item not found" };
  const image = item.image || item.image_url || item.icon || item.photo || "";
  return {
    title: `${item.name} — Newari Bhatti`,
    description: item.description || "Order online.",
    openGraph: {
      title: `${item.name} — Newari Bhatti`,
      description: item.description,
      url: `${SITE_URL}/menu/${params.slug}`,
      images: image ? [{ url: image, alt: item.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} — Newari Bhatti`,
      description: item.description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function MenuItemPage({ params }: { params: { slug: string } }) {
  const item = await getMenuItemBySlug(params.slug);
  if (!item) notFound();

  const image = item.image || item.image_url || item.icon || item.photo || "";

  // JSON-LD for MenuItem
  const menuItemSchema = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: item.name,
    description: item.description || "",
    image: image,
    url: `${SITE_URL}/menu/${params.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: item.price || "0",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main style={{ padding: 20 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(menuItemSchema) }} />
      <h1>{item.name}</h1>
      <p>{item.description}</p>
      <p>{item.price}</p>
      {image ? (
        <div style={{ maxWidth: 900 }}>
          <Image src={image} alt={item.name} width={1200} height={630} style={{ width: "100%", height: "auto" }} />
        </div>
      ) : null}
      {/* order CTA */}
    </main>
  );
}
