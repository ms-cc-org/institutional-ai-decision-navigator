import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import "./refinements.css";
export const metadata: Metadata = { title: "Institutional AI Decision Navigator", description: "Evidence-based institutional AI decision roadmaps." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><header className="site-header"><Link href="/" className="brand">Institutional AI <span>Decision Navigator</span></Link><div className="version">Evidence-based decision support</div></header>{children}<footer><span>Institutional AI Decision Navigator</span><span>Recommendations are deterministic and traceable to evidence.</span></footer></body></html>; }
