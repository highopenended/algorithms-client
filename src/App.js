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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768; // Tailwind's md breakpoint
  const listOfAlgos = ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Binary Search'];

  return (
    <div className="h-screen w-screen overflow-hidden">
      {!isMobile ? (
        // Desktop Layout
        <div className="flex h-full">
          <p>Desktop: {windowWidth}</p>
          <AlgoList 
            algoNames={listOfAlgos}
            selectedAlgo={selectedAlgo}
            onSelectAlgo={setSelectedAlgo}
            isMobileView={false}
            onToggleMobileView={() => {}}
          />
          <InteractionZone selectedAlgo={selectedAlgo} />
        </div>
      ) : (
        // Mobile Layout
        <div className="flex h-full relative">
          <p>Mobile: {windowWidth}</p>
          <AlgoList 
            algoNames={listOfAlgos}
            selectedAlgo={selectedAlgo}
            onSelectAlgo={(algo) => {
              setSelectedAlgo(algo);
              setIsMobileView(false);
            }}
            isMobileView={true}
            onToggleMobileView={() => setIsMobileView(!isMobileView)}
          />
          <InteractionZone selectedAlgo={selectedAlgo} />
        </div>
      )}
    </div>
  );
}

export default App;


