// app/head.tsx
export default function Head() {
  const siteUrl = "https://newaribhattiandkathmandumomoghar.com";
  const logoUrl =
    "https://nweybjowqtrqpdxqfwkg.supabase.co/storage/v1/object/public/menu-images/Banner/Logo.png";
    // <-- Keep this if your logo is hosted in Supabase and is publicly accessible.
    // If you move the logo to your website, use: "https://newaribhattiandkathmandumomoghar.com/logo.png"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "url": siteUrl,
    "name": "Newari Bhatti & Kathmandu Momo Ghar",
    "logo": logoUrl,
    "sameAs": [
      // Add social pages if any
      // "https://facebook.com/yourpage",
      // "https://instagram.com/yourpage"
    ]
  };

  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />

      {/* Basic SEO */}
      <title>Newari Bhatti & Kathmandu Momo Ghar</title>
      <meta name="description" content="Authentic Newari dishes and momos in Kathmandu. Order online or visit Newari Bhatti & Kathmandu Momo Ghar." />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Newari Bhatti & Kathmandu Momo Ghar" />
      <meta property="og:title" content="Newari Bhatti & Kathmandu Momo Ghar" />
      <meta property="og:description" content="Authentic Newari dishes and momos in Kathmandu. Order online or visit us." />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={logoUrl} />
      <meta property="og:image:alt" content="Newari Bhatti & Kathmandu Momo Ghar logo" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Newari Bhatti & Kathmandu Momo Ghar" />
      <meta name="twitter:description" content="Authentic Newari dishes and momos in Kathmandu." />
      <meta name="twitter:image" content={logoUrl} />

      {/* Favicons (place actual files in public/) */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* JSON-LD Organization (important for Google to pick up logo) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
