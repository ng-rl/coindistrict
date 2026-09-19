export function LegendBar() {
  return (
    <div className="bg-cd-bg border-b border-cd-line px-4 py-2">
      <div className="flex items-center justify-center gap-4 text-xs text-cd-muted">
        <span>← Higher mcap · Lower →</span>
        <span className="text-cd-line">|</span>
        <span>Ads every 7 plots</span>
      </div>
    </div>
  );
}
