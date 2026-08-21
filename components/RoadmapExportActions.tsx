export function RoadmapExportActions({ onCopy, onDownload, onPrint }: {
  onCopy: () => void;
  onDownload: () => void;
  onPrint: () => void;
}) {
  return (
    <nav className="roadmap-export-actions screen-only" aria-label="Export roadmap">
      <button aria-label="Copy roadmap summary" onClick={onCopy}>Copy summary</button>
      <button aria-label="Download roadmap as Markdown" onClick={onDownload}>Download Markdown</button>
      <button aria-label="Print roadmap or save as PDF" onClick={onPrint}>Print / Save as PDF</button>
    </nav>
  );
}
