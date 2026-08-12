import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import "./refinements.css";

export const metadata: Metadata = {
  title: "Institutional AI Decision Navigator",
  description: "Evidence-traceable institutional AI decision support.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">Institutional AI <span>Decision Navigator</span></Link>
          <nav className="site-nav" aria-label="Site information">
            <Link href="/methodology">Methodology</Link>
            <Link href="/sources">Sources</Link>
            <span className="version">Evidence-traceable decision support</span>
          </nav>
        </header>
        {children}
        <footer>
          <span>Institutional AI Decision Navigator</span>
          <span>Recommendations are deterministic and show the evidence and synthesis behind each decision.</span>
          <Link href="/methodology">Methodology and limitations</Link>
        </footer>
      </body>
    </html>
  );
}
