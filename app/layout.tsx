// app/layout.tsx
import React, { JSX } from "react";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pacifico",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * NOTE:
 * - Leave SITE_URL without trailing slash for consistent URL building.
 * - Replace address / coords / phone / social links with the real values if needed.
 */
const SITE_URL = "https://newaribhattiandkathmandumomoghar.com";
const LOGO =
  "https://nweybjowqtrqpdxqfwkg.supabase.co/storage/v1/object/public/menu-images/Banner/Logo.png";
const DEFAULT_IMAGE = LOGO;

/**
 * Root-level metadata for Next.js App Router
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Newari Bhatti & Kathmandu Momo Center",
    template: "%s | Newari Bhatti & Kathmandu Momo Center",
  },
  description:
    "Newari Bhatti & Kathmandu Momo Center — Authentic Newari & Kathmandu-style momos, thakali sets and local Nepali dishes in Pokhara. Order pickup or delivery.",
  keywords: [
    "Newari cuisine Pokhara",
    "Kathmandu momo shop",
    "Newari Bhatti Pokhara",
    "best momo in Pokhara",
    "authentic Nepali food",
    "traditional Newari food",
    "momo ghar Pokhara",
    "Kathmandu style momos",
    "Newari khaja set",
    "Nepalese local dishes",
    "momo delivery Pokhara",
    "Newari restaurant Nepal",
    "Thakali food Pokhara",
    "best momo near me",
    "Newari Bhatti & Kathmandu Momo Center",
  ],
  authors: [{ name: "Newari Bhatti & Kathmandu Momo Center", url: SITE_URL }],
  publisher: "Newari Bhatti & Kathmandu Momo Center",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Newari Bhatti & Kathmandu Momo Center",
    description:
      "Authentic Newari & Kathmandu-style momos, thakali sets and local Nepali dishes in Pokhara. Order pickup or delivery.",
    url: SITE_URL,
    siteName: "Newari Bhatti & Kathmandu Momo Center",
    locale: "en_US",
    images: [
      {
        url: LOGO,
        alt: "Newari Bhatti & Kathmandu Momo Center - Logo",
        width: 1200,
        height: 630,
      },

      
      // Recommended: add a high-quality banner image (1200x630) and include it here:
      // { url: new URL('/images/og-banner.jpg', SITE_URL).toString(), alt: 'Momos and Newari dishes', width: 1200, height: 630 }
    
    
    
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Newari Bhatti & Kathmandu Momo Center",
    description:
      "Authentic Newari & Kathmandu-style momos, thakali sets and local Nepali dishes in Pokhara. Order pickup or delivery.",
    images: [LOGO],
  },
  icons: {
    icon: LOGO,
    apple: LOGO,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

/**
 * JSON-LD Restaurant schema for rich results
 * Replace the placeholders with exact data where available.
 */
const schema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Newari Bhatti & Kathmandu Momo Center",
  url: SITE_URL,
  logo: LOGO,
  image: [DEFAULT_IMAGE],
  description:
    "Authentic Newari & Kathmandu-style momos and local dishes. Order online for pickup or delivery.",
  telephone: "+9779813113874", // use international format, no dashes
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+9779813113874",
      contactType: "customer service",
      areaServed: "NP",
      availableLanguage: ["English", "Nepali"],
    },
  ],
  priceRange: "₨₨", // better to use 1-3 symbols depending on your pricing tier
  address: {
    "@type": "PostalAddress",
    streetAddress: "PCM College Agardi, Nadipur, Pokhara 33700, Nepal",
    addressLocality: "Pokhara",
    addressRegion: "Gandaki",
    postalCode: "33700",
    addressCountry: "NP",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "27.6928", // replace with exact latitude
    longitude: "85.3270", // replace with exact longitude
  },
  servesCuisine: ["Nepali", "Newari", "Momos"],
  sameAs: [
    "https://www.facebook.com/profile.php?id=61570343842043", // replace with official links
    "https://api.whatsapp.com/send?phone=%2B9779813113874&context=AfdzvzzXGFWXTefh0gyuJPLJw_idce3TMihWRPurM4ImGlGvmEbyC1jMimr4dJ0M2JrSHQ7szPXZhIBM_UMDlioCP2BVrXwCk28aLytaZSx0RRfVCjPT3e_owwjAN3ubkiKQApb0giWQcG9nOotdgBBopw&source=FB_Page&app=facebook&entry_point=page_cta",
    "https://maps.app.goo.gl/Dhvo4qtoJDi68ZS4A"
  ],
  menu: new URL("/menu", SITE_URL).toString(),
  hasMenu: new URL("/menu", SITE_URL).toString(),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "22:00",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}
      >
        {/* JSON-LD structured data for rich results */}
        <script
          key="ld-json"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {children}
      </body>
    </html>
  );
}
