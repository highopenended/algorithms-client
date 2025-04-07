import React from 'react';
import { motion } from 'framer-motion';

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
        <div className="fixed inset-0 z-40 bg-gray-100">
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
