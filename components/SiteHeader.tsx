import Image from "next/image";
import Link from "next/link";
import { institutionConfig } from "../config/institution";
import type { InstitutionConfig } from "../config/institution";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const assetUrl = (path: string) => path.startsWith("http://") || path.startsWith("https://") ? path : `${basePath}${path}`;

export function SiteHeader({ config = institutionConfig }: { config?: InstitutionConfig }) {
  const deploymentLabel = config.deploymentMode === "mscc_reference" ? `${config.shortName} Pilot` : `${config.shortName} deployment`;
  return (
    <header className="site-header">
      <div className="header-branding">
        <Link href="/" className="mscc-mark" aria-label={`${config.institutionName}, home`}>
          <Image src={assetUrl(config.logoHorizontal)} alt={config.institutionName} width={config.logoHorizontalWidth} height={config.logoHorizontalHeight} priority unoptimized />
        </Link>
        <Link href="/" className="product-name">{config.productNamePrimary} <span>{config.productNameSecondary}</span></Link>
      </div>
      <nav className="site-nav" aria-label="Primary navigation">
        <Link href="/explore">Browse topics</Link>
        <Link href="/methodology">Methodology</Link>
        <Link href="/sources">Sources</Link>
        <span className="version">{deploymentLabel}</span>
      </nav>
    </header>
  );
}
