# CoinDistrict

> Horizontal crypto district: plots are projects. L→R = biggest mcap → smaller; height = on-chain volume; weekly rent keeps lights on.

## Overview

CoinDistrict is a visual representation of the cryptocurrency market as an interactive horizontal street. Each building represents a crypto project, with positioning and appearance driven by real market metrics.

### Core Mechanics

- **Street Order**: Left to right, sorted by market cap (descending)
- **Building Height**: Determined by 24h trading volume / TVL
- **Rent Status**: PAID (active, glowing) vs DUE (dimmed, at eviction risk)
- **Ad Plots**: Sponsored plots appear every ~7 organic buildings
- **Allocation**: Storefront promo space on a plot

## Design System

Vibe: Quiet night-market financial district. Soft black, ONE electric mint accent (#3DFF9A). Transit-map wordmark energy.

### Color Palette

```css
--cd-bg: #0B0B0C        /* Background */
--cd-surface: #141416   /* Surface elements */
--cd-line: #222226      /* Borders & dividers */
--cd-text: #F4F4F5      /* Primary text */
--cd-muted: #8B8B93     /* Secondary text */
--cd-mint: #3DFF9A      /* Accent (paid rent) */
--cd-ad: #E8C36A        /* Advertisement plots */
--cd-due: #FF6B6B       /* Overdue rent */
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3 with custom design tokens
- **3D Buildings**: CSS 3D transforms (architecture ready for WebGL swap)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

Outputs to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Building.tsx          # 3D building component (coin & ad plots)
│   ├── Street.tsx            # Horizontal scrollable street container
│   ├── TabBar.tsx            # Navigation tabs
│   └── PlotDetailSheet.tsx   # Bottom sheet for plot details
├── data/
│   └── mockData.ts           # Mock coin data and street generation
├── types.ts                  # TypeScript type definitions
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
└── index.css                 # Global styles & Tailwind directives
```

## Features

### v0 Scaffold (Current)

- ✅ Horizontal scrollable street with snap points
- ✅ CSS 3D mesh buildings (coin plots + ad plots)
- ✅ Mock data: 20 coins sorted by market cap
- ✅ Ad insertions every ~7 plots
- ✅ Rent status visualization (PAID glow, DUE dimmed)
- ✅ Tab navigation stubs (Street / My Plots / Rent)
- ✅ Bottom sheet for plot details
- ✅ Mobile-first responsive design
- ✅ Fran's locked palette as CSS variables

### Architecture Notes

The `Building` component is designed with a swappable renderer interface:

```tsx
interface BuildingProps {
  plot: CoinData | AdPlot;
  onClick: () => void;
}
```

Current implementation uses CSS 3D transforms. The component can be refactored to use WebGL (Three.js, React Three Fiber) without changing the parent components or data flow.

### Future Considerations

- Live market data integration (CoinGecko, CoinMarketCap)
- WebGL building renderer for performance & visual fidelity
- User authentication & plot ownership
- Rent payment mechanics
- Allocation (storefront ads) system
- Shareable street freeze-frames
- Street navigation (minimap, search, jump-to-plot)

## Deployment

This project is configured for Netlify static site deployment:

1. Connect your GitHub repo to Netlify
2. Build settings are in `netlify.toml`
3. Deploy automatically on push to `main`

Manual deploy:

```bash
npm run build
netlify deploy --prod --dir=dist
```

## License

Private project - All rights reserved

## Contact

For questions or feedback, open an issue in the repository.
