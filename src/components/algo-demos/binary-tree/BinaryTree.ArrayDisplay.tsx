import React from 'react';
import { NodeArray } from './BinaryTree.types';

interface ArrayDisplayProps {
    mainArr: NodeArray;
    screenWidth: number;
    screenHeight: number;
    selectedArrIndex: number | null;
    onSelectIndex: (index: number) => void;
}

/**
 * Displays an array of nodes in a horizontal format
 * Each node's index is displayed in a box, null nodes are shown as empty slots
 */
const ArrayDisplay: React.FC<ArrayDisplayProps> = ({ 
    mainArr, 
    screenWidth,
    selectedArrIndex,
    onSelectIndex 
}) => {
    return (
        <div className="flex flex-wrap gap-2 p-4 w-full">
            {mainArr.map((node, index) => (
                <div 
                    key={index}
                    onClick={() => onSelectIndex(index)}
                    className={`
                        flex items-center justify-center min-w-[40px] h-[40px] 
                        ${node ? 'bg-gray-200' : 'bg-gray-100'} 
                        ${selectedArrIndex === index ? 'ring-2 ring-blue-500' : ''}
                        rounded border border-gray-300
                        cursor-pointer
                        transition-all duration-200
                    `}
                >
                    {node ? node.index : ''}
                </div>
            ))}
        </div>
    );
};

export default ArrayDisplay; 