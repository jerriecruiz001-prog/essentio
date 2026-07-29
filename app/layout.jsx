import { Suspense } from "react";
import Script from "next/script";
import TikTokPixel from "./TikTokPixel";
import "../styles.css";

const siteUrl = "https://www.shopessentio.online";
const title = "Essentio™ — Premium Smart Wallets & Passport Holders | JCRUIZ & CO";
const description =
  "Essentio by JCRUIZ & CO. Premium leather smart wallets and passport holders with built-in power banks, RFID blocking, and MagSafe charging. Engineered for the modern professional.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "smart wallet",
    "passport holder",
    "power bank wallet",
    "RFID wallet",
    "MagSafe wallet",
    "premium wallet Nigeria",
    "Essentio",
    "JCRUIZ",
  ],
  authors: [{ name: "JCRUIZ & CO" }],
  robots: "index, follow",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    title: "Essentio™ — Premium Everyday & Travel Essentials",
    description:
      "Where premium leather meets smart technology. Power, security, and presence — engineered into the essentials you carry every day.",
    url: siteUrl,
    siteName: "Essentio by JCRUIZ & CO",
    images: [{ url: "/images/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Essentio™ — Premium Everyday & Travel Essentials",
    description:
      "Where premium leather meets smart technology. Power, security, and presence — engineered into the essentials you carry every day.",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

const productSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Essentio Smart Wallet",
    brand: { "@type": "Brand", name: "Essentio by JCRUIZ & CO" },
    description:
      "Premium leather smart wallet with 8000mAh power bank, MagSafe wireless charging, and RFID blocking.",
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: "59999",
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/#smart-wallet`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Essentio Passport Holder",
    brand: { "@type": "Brand", name: "Essentio by JCRUIZ & CO" },
    description:
      "Premium leather passport holder with 8000mAh power bank, RFID blocking, and Apple Find My compatibility. Designed for international travel.",
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: "54999",
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/#passport-holder`,
    },
  },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Sora:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{if(localStorage.getItem('essentio-theme')==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      </head>
      <body>
        {children}
        <Suspense fallback={null}>
          <TikTokPixel />
        </Suspense>
      </body>
    </html>
  );
}
