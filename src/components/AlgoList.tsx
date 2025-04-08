import React from "react";

type AlgoListProps = {
    algoNames: string[];
    selectedAlgo: string | null;
    onSelectAlgo: (algo: string) => void;
    isMobile?: boolean;
};

const AlgoList = ({ algoNames, selectedAlgo, onSelectAlgo, isMobile = false }: AlgoListProps) => {
    const baseClasses = "bg-gray-100 border-r border-gray-300";
    const mobileClasses = "fixed inset-0 z-40";
    const desktopClasses = "h-full w-64 flex-shrink-0";

    return (
        <div className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Algorithms</h2>
                <div className="space-y-2">
                    {algoNames.map((algoName) => (
                        <div
                            key={algoName}
                            className={`
                                p-2 rounded cursor-pointer whitespace-nowrap
                                ${selectedAlgo === algoName ? "bg-blue-500 text-white" : "hover:bg-gray-200"}
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