import Image from "next/image";
import Link from "next/link";
import { NSF_ATTRIBUTION } from "../lib/attribution";
import { institutionConfig } from "../config/institution";
import type { InstitutionConfig } from "../config/institution";
import { versionInfo } from "../lib/version";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const assetUrl = (path: string) => path.startsWith("http://") || path.startsWith("https://") ? path : `${basePath}${path}`;

export function SiteFooter({ config = institutionConfig }: { config?: InstitutionConfig }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Image src={assetUrl(config.logoVertical)} alt={config.institutionName} width={config.logoVerticalWidth} height={config.logoVerticalHeight} unoptimized />
        <p>{config.productName}</p>
        <Link href="/methodology">Methodology and limitations</Link>
        <Link href={config.contactUrl}>{config.contactLabel}</Link>
      </div>
      <div className="funding-attribution">
        <p>{config.aboutText}</p>
        {config.showMsccAttribution && NSF_ATTRIBUTION.map((line) => <p key={line}>{line}</p>)}
        <p>Based on MS-CC core ontology v{versionInfo.coreOntology} · Application v{versionInfo.application} · Local config {config.configVersion}</p>
      </div>
    </footer>
  );
}
