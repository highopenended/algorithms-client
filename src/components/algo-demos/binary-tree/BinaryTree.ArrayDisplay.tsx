import React from 'react';

interface ArrayDisplayProps {
    mainArr: number[];
    screenWidth: number;
    screenHeight: number;
}

/**
 * Displays an array of numbers in a horizontal format
 * Each number is contained in a square bracket
 */
const ArrayDisplay: React.FC<ArrayDisplayProps> = ({ mainArr, screenWidth }) => {
    return (
        <div className="flex flex-wrap gap-2 p-4 w-full">
            {mainArr.map((num, index) => (
                <div 
                    key={index}
                    className="flex items-center justify-center min-w-[40px] h-[40px] bg-gray-200 rounded border border-gray-300"
                >
                    {num}
                </div>
            ))}
        </div>
    );
};

export default ArrayDisplay; 