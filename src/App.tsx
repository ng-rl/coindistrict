import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlotData, isCoinPlot } from './types';
import { generateStreetData } from './data/mockData';
import { PhoneStage } from './components/PhoneStage';
import { Header } from './components/Header';
import { LegendBar } from './components/LegendBar';
import { TabBar } from './components/TabBar';
import { PlotSheet } from './components/PlotSheet';
import { FocusCard } from './components/FocusCard';
import { RankRail } from './components/RankRail';
import { SwipeHint } from './components/SwipeHint';
import { captureShareCard } from './components/ShareCard';
import { CityStage } from './city/CityStage';
import { StreetController } from './city/StreetController';
import { heightsForStreet } from './city/layout';
import { H_MAX, H_MIN } from './city/constants';

type Tab = 'street' | 'myPlots' | 'rent';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('street');
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const streetData = useMemo(() => generateStreetData(), []);
  const controller = useRef(new StreetController()).current;

  useEffect(() => {
    controller.count = streetData.length;
    // QA hook: lets screenshot scripts jump the street deterministically
    (window as unknown as { __coindistrict?: StreetController }).__coindistrict = controller;
    const offFocus = controller.onFocus(setFocusIndex);
    const offScroll = controller.onFirstScroll(() => setHintVisible(false));
    const t = window.setTimeout(() => setHintVisible(false), 9000);
    return () => {
      offFocus();
      offScroll();
      window.clearTimeout(t);
    };
  }, [controller, streetData.length]);

  const railHeights = useMemo(() => {
    const h = heightsForStreet(streetData);
    return streetData.map((p) => (isCoinPlot(p) ? ((h.get(p.id) ?? H_MIN) - H_MIN) / (H_MAX - H_MIN) : 0.35));
  }, [streetData]);

  const coinRank = useCallback(
    (index: number) => streetData.slice(0, index + 1).filter(isCoinPlot).length,
    [streetData]
  );

  const handleTapPlot = useCallback(
    (index: number) => {
      controller.goTo(index, 420);
      setSelectedPlot(streetData[index] ?? null);
    },
    [controller, streetData]
  );

  const handleShare = async () => {
    try {
      await captureShareCard(streetData[focusIndex], coinRank(focusIndex));
    } catch (error) {
      console.error('Failed to capture share card:', error);
    }
  };

  const focusPlot = streetData[focusIndex];

  return (
    <PhoneStage>
      {/* the stage is the whole world; chrome floats on top */}
      <CityStage plots={streetData} controller={controller} focusIndex={focusIndex} onTapPlot={handleTapPlot} />

      <div className="hud-top absolute left-0 right-0 top-0 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Header onSearchClick={() => controller.goTo(0)} onShareClick={handleShare} />
          <LegendBar />
        </div>
      </div>

      <SwipeHint visible={hintVisible && activeTab === 'street'} />

      <div className="hud-bottom absolute left-0 right-0 bottom-0 z-10 flex flex-col">
        {activeTab === 'street' && (
          <div className="px-3 pb-2 flex flex-col gap-2">
            <FocusCard
              plot={focusPlot}
              index={focusIndex}
              rank={coinRank(focusIndex)}
              count={streetData.length}
              onOpen={() => setSelectedPlot(focusPlot ?? null)}
            />
            <RankRail plots={streetData} heights={railHeights} focusIndex={focusIndex} onJump={(i) => controller.goTo(i, 600)} />
          </div>
        )}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab !== 'street' && (
        <div
          className="absolute inset-x-0 top-0 bottom-[52px] z-[9] flex items-center justify-center"
          style={{ background: 'rgba(11,11,12,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <div className="text-center p-8">
            <p className="text-cd-text text-lg font-semibold">{activeTab === 'myPlots' ? 'My plots' : 'Rent'}</p>
            <p className="text-cd-muted text-sm mt-2">Coming soon · the street is the product</p>
          </div>
        </div>
      )}

      <PlotSheet plot={selectedPlot} onClose={() => setSelectedPlot(null)} />
    </PhoneStage>
  );
}

export default App;
