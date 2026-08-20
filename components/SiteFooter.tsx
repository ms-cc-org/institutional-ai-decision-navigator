import Image from "next/image";
import Link from "next/link";
import { NSF_ATTRIBUTION } from "../lib/attribution";

const basePath = process.env.PAGES_BASE_PATH ?? "";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Image src={`${basePath}/brand/mscc-logo-vertical.png`} alt="MS-CC — Minority Serving Cyberinfrastructure Consortium" width={182} height={139} unoptimized />
        <p>Institutional AI Decision Navigator</p>
        <Link href="/methodology">Methodology and limitations</Link>
      </div>
      <div className="funding-attribution">
        {NSF_ATTRIBUTION.map((line) => <p key={line}>{line}</p>)}
      </div>
    </footer>
  );
}
