import Image from "next/image";
import Link from "next/link";

const basePath = process.env.PAGES_BASE_PATH ?? "";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-branding">
        <Link href="/" className="mscc-mark" aria-label="MS-CC — Minority Serving Cyberinfrastructure Consortium, home">
          <Image src={`${basePath}/brand/mscc-logo-horizontal.png`} alt="MS-CC — Minority Serving Cyberinfrastructure Consortium" width={189} height={108} priority unoptimized />
        </Link>
        <Link href="/" className="product-name">Institutional AI <span>Decision Navigator</span></Link>
      </div>
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/explore">Browse topics</Link>
        <Link href="/methodology">Methodology</Link>
        <Link href="/sources">Sources</Link>
        <span className="version">Pilot · Evidence-traceable decision support</span>
      </nav>
    </header>
  );
}
