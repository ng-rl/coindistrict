import { BrandMark } from './BrandMark';

interface HeaderProps {
  onSearchClick?: () => void;
  onShareClick?: () => void;
}

export function Header({ onSearchClick, onShareClick }: HeaderProps) {
  return (
    <header className="shrink-0 px-4 pt-3 pb-2 flex items-center justify-between">
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
      
      <div className="flex items-center gap-2">
        <button
          onClick={onShareClick}
          className="hud-btn flex items-center justify-center border border-cd-line rounded-lg hover:bg-cd-line/30 transition-colors"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
          }}
          aria-label="Share street view"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 6C14.8807 6 16 4.88071 16 3.5C16 2.11929 14.8807 1 13.5 1C12.1193 1 11 2.11929 11 3.5C11 3.70163 11.0232 3.89788 11.0669 4.08579L6.75846 6.61551C6.29026 6.23146 5.67377 6 5 6C3.61929 6 2.5 7.11929 2.5 8.5C2.5 9.88071 3.61929 11 5 11C5.67377 11 6.29026 10.7685 6.75846 10.3845L11.0669 12.9142C11.0232 13.1021 11 13.2984 11 13.5C11 14.8807 12.1193 16 13.5 16C14.8807 16 16 14.8807 16 13.5C16 12.1193 14.8807 11 13.5 11C12.8262 11 12.2097 11.2315 11.7415 11.6155L7.43313 9.08579C7.47684 8.89788 7.5 8.70163 7.5 8.5C7.5 8.29837 7.47684 8.10212 7.43313 7.91421L11.7415 5.38449C12.2097 5.76854 12.8262 6 13.5 6Z" stroke="#8B8B93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        <button
          onClick={onSearchClick}
          className="hud-btn flex items-center justify-center border border-cd-line rounded-lg hover:bg-cd-line/30 transition-colors"
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
      </div>
    </header>
  );
}
