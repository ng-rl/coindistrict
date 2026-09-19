export function BrandMark() {
  return (
    <div
      className="flex items-center justify-center rounded-md border-2"
      style={{
        width: '22px',
        height: '22px',
        borderColor: 'var(--cd-mint)',
        backgroundColor: 'var(--cd-mint-dim)',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="2.5" height="6" fill="#3DFF9A" />
        <rect x="5.75" y="3" width="2.5" height="9" fill="#3DFF9A" />
        <rect x="9.5" y="5" width="2.5" height="7" fill="#3DFF9A" />
      </svg>
    </div>
  );
}
