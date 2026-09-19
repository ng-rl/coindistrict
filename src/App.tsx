import { useState, useEffect } from 'react';
import { PlotData } from './types';
import { generateStreetData } from './data/mockData';
import { PhoneStage } from './components/PhoneStage';
import { Header } from './components/Header';
import { LegendBar } from './components/LegendBar';
import { TabBar } from './components/TabBar';
import { StreetScroller } from './components/StreetScroller';
import { PlotSheet } from './components/PlotSheet';

type Tab = 'street' | 'myPlots' | 'rent';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('street');
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [streetData, setStreetData] = useState<PlotData[]>([]);
  
  useEffect(() => {
    setStreetData(generateStreetData());
  }, []);
  
  const handlePlotClick = (plot: PlotData) => {
    setSelectedPlot(plot);
  };
  
  const handleCloseSheet = () => {
    setSelectedPlot(null);
  };
  
  return (
    <PhoneStage>
      <Header onSearchClick={() => console.log('Search clicked')} />
      <LegendBar />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {activeTab === 'street' && (
          <StreetScroller plots={streetData} onPlotClick={handlePlotClick} />
        )}
        
        {activeTab === 'myPlots' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-cd-muted text-lg">My Plots</p>
              <p className="text-cd-muted text-sm mt-2">Coming soon</p>
            </div>
          </div>
        )}
        
        {activeTab === 'rent' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-cd-muted text-lg">Rent Management</p>
              <p className="text-cd-muted text-sm mt-2">Coming soon</p>
            </div>
          </div>
        )}
      </main>
      
      <PlotSheet plot={selectedPlot} onClose={handleCloseSheet} />
    </PhoneStage>
  );
}

export default App;
