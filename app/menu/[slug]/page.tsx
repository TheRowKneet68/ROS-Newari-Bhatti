// app/menu/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

const SITE_URL = "https://newaribhow..."; // optional fallback

// Replace this mock with your real data fetching (Supabase / CMS / DB)
async function getMenuItemBySlug(slug: string) {
  // Example mock. Replace with real fetch.
  const mockDB = {
    "chicken-momo": {
      name: "Chicken Momo",
      description: "Steamed chicken momos served with achar.",
      image:
        "https://nweybjowqtrqpdxqfwkg.supabase.co/storage/v1/object/public/menu-images/Items/chicken-momo.jpg",
      price: "₨ 250",
    },
    "veg-momo": {
      name: "Veg Momo",
      description: "Fresh mixed vegetable momos with house chutney.",
      image:
        "https://nweybjowqtrqpdxqfwkg.supabase.co/storage/v1/object/public/menu-images/Items/veg-momo.jpg",
      price: "₨ 220",
    },
  };
  return mockDB[slug] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const item = await getMenuItemBySlug(slug);

  if (!item) {
    return {
      title: "Item not found",
    };
  }

  return {
    title: `${item.name} — Newari Bhatti`,
    description: item.description,
    openGraph: {
      title: `${item.name} — Newari Bhatti`,
      description: item.description,
      images: [{ url: item.image, alt: item.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} — Newari Bhatti`,
      description: item.description,
      images: [item.image],
    },
  };
}

export default async function MenuItemPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getMenuItemBySlug(params.slug);
  if (!item) notFound();

  return (
    <main style={{ padding: 20 }}>
      <h1>{item.name}</h1>
      <p>{item.description}</p>
      <p>{item.price}</p>
      <div style={{ maxWidth: 800 }}>
        <Image
          src={item.image}
          alt={item.name}
          width={1200}
          height={630}
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      {/* Add order CTA or link to cart here */}
    </main>
  );
}
