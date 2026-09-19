type Tab = 'street' | 'myPlots' | 'rent';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'street', label: 'Street' },
    { id: 'myPlots', label: 'My Plots' },
    { id: 'rent', label: 'Rent' },
  ];
  
  return (
    <nav className="flex border-b border-cd-line bg-cd-bg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-cd-mint border-b-2 border-cd-mint'
              : 'text-cd-muted hover:text-cd-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
