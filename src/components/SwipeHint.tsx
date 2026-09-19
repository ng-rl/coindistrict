export function SwipeHint({ visible }: { visible: boolean }) {
  return (
    <div
      className="swipe-hint pointer-events-none absolute left-0 right-0 flex justify-center"
      style={{ top: '38%', opacity: visible ? 1 : 0, transition: 'opacity 500ms cubic-bezier(0.22,1,0.36,1)' }}
      aria-hidden={!visible}
    >
      <div
        className="px-3 py-1.5 rounded-full text-[12px] text-cd-text border border-cd-line"
        style={{ background: 'rgba(11,11,12,0.6)', backdropFilter: 'blur(6px)' }}
      >
        Swipe the street · tap a plot
      </div>
    </div>
  );
}
