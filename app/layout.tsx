import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { CANONICAL_SITE_URL, PRODUCT_DESCRIPTION, PRODUCT_TITLE } from "../lib/site";
import "./globals.css";
import "./refinements.css";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  title: PRODUCT_TITLE,
  description: PRODUCT_DESCRIPTION,
  alternates: { canonical: CANONICAL_SITE_URL },
  openGraph: {
    title: PRODUCT_TITLE,
    description: PRODUCT_DESCRIPTION,
    url: CANONICAL_SITE_URL,
    siteName: PRODUCT_TITLE,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: PRODUCT_TITLE,
    description: PRODUCT_DESCRIPTION,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
