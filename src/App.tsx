import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlotData, isCoinPlot, isLotPlot } from './types';
import { buildStreet, districtStart as findDistrictStart, downtownRank, zoneOf } from './data/mockData';
import { LeaseRequest, loadLeaseRequests } from './data/ledger';
import { MyPlotsPanel } from './components/MyPlotsPanel';
import { RentPanel } from './components/RentPanel';
import { useMarketData } from './data/market';
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
  const market = useMarketData();
  const streetData = useMemo(() => buildStreet(market.coins, market.tenants), [market.coins, market.tenants]);
  const districtStart = useMemo(() => findDistrictStart(streetData), [streetData]);
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>(() => loadLeaseRequests());
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
    return streetData.map((p) => (isCoinPlot(p) ? ((h.get(p.id) ?? H_MIN) - H_MIN) / (H_MAX - H_MIN) : isLotPlot(p) ? 0 : 0.35));
  }, [streetData]);

  const coinRank = useCallback((index: number) => downtownRank(streetData, index), [streetData]);
  const firstLot = useMemo(() => streetData.findIndex(isLotPlot), [streetData]);

  const handleTapPlot = useCallback(
    (index: number) => {
      controller.goTo(index, 420);
      setSelectedPlot(streetData[index] ?? null);
    },
    [controller, streetData]
  );

  const handleShare = async () => {
    try {
      await captureShareCard(streetData[focusIndex], coinRank(focusIndex) ?? 0);
    } catch (error) {
      console.error('Failed to capture share card:', error);
    }
  };

  const focusPlot = streetData[focusIndex];
  const sheetPlot = selectedPlot ? streetData.find((p) => p.id === selectedPlot.id) ?? selectedPlot : null;

  return (
    <PhoneStage>
      {/* the stage is the whole world; chrome floats on top */}
      <CityStage plots={streetData} controller={controller} focusIndex={focusIndex} onTapPlot={handleTapPlot} />

      <div className="hud-top absolute left-0 right-0 top-0 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Header onSearchClick={() => controller.goTo(0)} onShareClick={handleShare} />
          <LegendBar source={market.source} updatedAt={market.updatedAt} zone={zoneOf(streetData, focusIndex)} />
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
            <RankRail plots={streetData} heights={railHeights} focusIndex={focusIndex} districtStart={districtStart} onJump={(i) => controller.goTo(i, 600)} />
          </div>
        )}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab !== 'street' && (
        <div
          className="absolute inset-x-0 z-[9] overflow-hidden"
          style={{ top: 92, bottom: 'calc(48px + env(safe-area-inset-bottom, 0px))', background: 'rgba(11,11,12,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
          {activeTab === 'myPlots' ? (
            <MyPlotsPanel
              requests={leaseRequests}
              onFindLot={() => {
                setActiveTab('street');
                if (firstLot >= 0) controller.goTo(firstLot, 900);
              }}
            />
          ) : (
            <RentPanel
              plots={streetData}
              onJump={(i) => {
                setActiveTab('street');
                controller.goTo(i, 700);
              }}
            />
          )}
        </div>
      )}

      <PlotSheet
        plot={sheetPlot}
        onClose={() => setSelectedPlot(null)}
        onLeaseRequested={(req) => setLeaseRequests((all) => [req, ...all.filter((r) => r.id !== req.id)])}
      />
    </PhoneStage>
  );
}

export default App;
