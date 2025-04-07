import { useEffect, useState } from 'react';
import AlgoList from './components/AlgoList.tsx';
import InteractionZone from './components/InteractionZone.tsx';

function App() {
  const [selectedAlgo, setSelectedAlgo] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobileView(width < 768);
    };
    handleResize(); // Call on initial render
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768; // Tailwind's md breakpoint
  const listOfAlgos = ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Binary Search'];

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Desktop Layout */}
      {!isMobile && (
        <div className="flex h-full">
          <AlgoList 
            algoNames={listOfAlgos}
            selectedAlgo={selectedAlgo}
            onSelectAlgo={setSelectedAlgo}
            isMobile={false}
          />
          <InteractionZone 
            selectedAlgo={selectedAlgo}
            onToggleMobileView={() => {}}
            isMobile={false}
          />
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          <AlgoList 
            algoNames={listOfAlgos}
            selectedAlgo={selectedAlgo}
            onSelectAlgo={(algo) => {
              setSelectedAlgo(algo);
              setIsMobileView(true);
            }}
            isMobile={true}
          />
          <InteractionZone 
            selectedAlgo={selectedAlgo}
            onToggleMobileView={() => {
              setSelectedAlgo(null);
              setIsMobileView(false);
            }}
            isMobile={true}
          />
        </>
      )}
    </div>
  );
}

export default App;


