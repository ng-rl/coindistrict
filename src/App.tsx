import { useState, useEffect } from 'react';
import { PlotData } from './types';
import { generateStreetData } from './data/mockData';
import { TabBar } from './components/TabBar';
import { Street } from './components/Street';
import { PlotDetailSheet } from './components/PlotDetailSheet';

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
  
  const handleCloseDetail = () => {
    setSelectedPlot(null);
  };
  
  return (
    <div className="h-screen w-screen bg-cd-bg flex flex-col">
      <header className="bg-cd-surface border-b border-cd-line px-4 py-4">
        <h1 className="text-xl font-bold text-cd-text">
          <span className="text-cd-mint">Coin</span>District
        </h1>
        <p className="text-xs text-cd-muted mt-1">Horizontal crypto district</p>
      </header>
      
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {activeTab === 'street' && (
          <Street plots={streetData} onPlotClick={handlePlotClick} />
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
      
      <PlotDetailSheet plot={selectedPlot} onClose={handleCloseDetail} />
    </div>
  );
}

export default App;
