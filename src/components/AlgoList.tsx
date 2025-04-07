import React from 'react';

type AlgoListProps = {
    algoNames: string[];
    selectedAlgo: string | null;
    onSelectAlgo: (algo: string) => void;
    isMobileView: boolean;
    onToggleMobileView: () => void;
}

const AlgoList = ({ 
    algoNames, 
    selectedAlgo, 
    onSelectAlgo,
    isMobileView,
    onToggleMobileView 
}: AlgoListProps) => {
    return (
        <div className={`
            ${isMobileView 
                ? `fixed inset-0 z-50 w-full transform transition-transform duration-300 ease-in-out
                   ${selectedAlgo ? '-translate-x-full' : 'translate-x-0'}`
                : 'flex-none w-fit min-w-[200px] max-w-[33vw]'}
            bg-gray-100 h-full
        `}>
            {/* Mobile drag handle - only show when panel is hidden */}
            {isMobileView && selectedAlgo && (
                <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-20 bg-gray-300 rounded-r cursor-pointer"
                    onClick={onToggleMobileView}
                />
            )}
            
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Algorithms</h2>
                <div className="space-y-2">
                    {algoNames.map(algoName => (
                        <div 
                            key={algoName}
                            className={`
                                p-2 rounded cursor-pointer whitespace-nowrap
                                ${selectedAlgo === algoName ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}
                            `}
                            onClick={() => onSelectAlgo(algoName)}
                        >
                            {algoName}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlgoList;
