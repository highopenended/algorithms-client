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
            ${isMobileView ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
            bg-gray-100 min-w-[200px] max-w-[33vw] h-full
            transition-transform duration-300 ease-in-out
            ${isMobileView && !selectedAlgo ? 'translate-x-0' : '-translate-x-full'}
        `}>
            {/* Mobile drag handle */}
            {isMobileView && (
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
                                p-2 rounded cursor-pointer
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
