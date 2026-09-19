import { BrandMark } from './BrandMark';

interface HeaderProps {
  onSearchClick?: () => void;
}

export function Header({ onSearchClick }: HeaderProps) {
  return (
    <header className="bg-cd-surface border-b border-cd-line px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <BrandMark />
        <h1 
          className="text-lg font-bold text-cd-text"
          style={{
            letterSpacing: '-0.02em',
            fontWeight: 650,
          }}
        >
          CoinDistrict
        </h1>
      </div>
      
      <button
        onClick={onSearchClick}
        className="flex items-center justify-center bg-cd-surface border border-cd-line rounded-lg hover:bg-cd-line/30 transition-colors"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
        }}
        aria-label="Search"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="5" stroke="#8B8B93" strokeWidth="1.5" />
          <path d="M12 12L15 15" stroke="#8B8B93" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  );
}
