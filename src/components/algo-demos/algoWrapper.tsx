import React from "react";

export const AlgoWrapper = ({ algoName, algoComponent }: { algoName: string, algoComponent: React.ComponentType }) => {
    return (
        <div>
            <h2>{algoName}</h2>
        </div>
    );
};

export default AlgoWrapper;
