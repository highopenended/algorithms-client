import React from 'react';

type InteractionZoneProps = {
    selectedAlgo: string | null;
}

const InteractionZone = ({ selectedAlgo }: InteractionZoneProps) => {
    return (
        <div className="flex-1 bg-gray-100 p-4 overflow-auto">
            {selectedAlgo ? (
                <h2 className="text-xl font-bold mb-4">{selectedAlgo}</h2>
            ) : (
                <p className="text-gray-500">Select an algorithm to begin</p>
            )}
        </div>
    );
};

export default InteractionZone; 