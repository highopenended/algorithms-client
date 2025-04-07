import React from 'react';

type InteractionZoneProps = {
    selectedAlgo: string | null;
}

const InteractionZone = ({ selectedAlgo }: InteractionZoneProps) => {
    return (
        <div className="flex-1 bg-white p-4">
            {selectedAlgo ? (
                <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Visualization for {selectedAlgo} will appear here</p>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Select an algorithm to begin</p>
                </div>
            )}
        </div>
    );
};

export default InteractionZone; 