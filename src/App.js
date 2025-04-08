import { useEffect, useState } from 'react';
import AlgoList from './components/AlgoList.tsx';
import InteractionZone from './components/InteractionZone.tsx';
import { algoRegistry } from './components/algo-demos/_index.ts';

function App() {
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const isMobileView = screenWidth < 768;

  const checkMobileView = () => {
    const currentWidth = window.innerWidth;
    setScreenWidth(currentWidth);
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Desktop Layout */}
      {!isMobileView && (
        <div className="flex h-full">
          <AlgoList 
            algoRegistry={algoRegistry}
            selectedAlgo={selectedAlgo}
            onSelectAlgo={setSelectedAlgo}
            isMobile={false}
          />
          <InteractionZone 
            selectedAlgo={selectedAlgo}
            onToggleMobileView={() => {}}
            isMobile={false}
            checkMobileView={checkMobileView}
            screenWidth={screenWidth}
          />
        </div>
      )}

      {/* Mobile Layout */}
      {isMobileView && (
        <>
          <AlgoList 
            algoRegistry={algoRegistry}
            selectedAlgo={selectedAlgo}
            onSelectAlgo={(algo) => {
              setSelectedAlgo(algo);
            }}
            isMobile={true}
          />
          <InteractionZone 
            selectedAlgo={selectedAlgo}
            onToggleMobileView={() => {
              setSelectedAlgo(null);
            }}
            isMobile={true}
            checkMobileView={checkMobileView}
            screenWidth={screenWidth}
          />
        </>
      )}
    </div>
  );
}

export default App;
