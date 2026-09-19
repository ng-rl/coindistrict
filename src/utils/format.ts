export function formatUsd(n: number, digits = 1): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(digits === 1 ? 2 : digits)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(digits)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function rankLabel(index: number) {
  return `#${index + 1}`;
}
