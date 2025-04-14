import React from 'react';
import Tree from 'react-d3-tree';
import { Node, NodeArray } from './BinaryTree.types';

// Define the type for the tree data
interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
} 

interface DataTreeProps {
    mainArr: NodeArray;
    selectedArrIndex: number | null;
}

/**
 * Converts a Node structure into a tree data format for react-d3-tree
 * @param node Node to convert
 * @param currentIndex Current index in the array
 * @param selectedIndex Index of the selected node
 * @returns Tree data structure
 */
const nodeToTreeData = (
    node: Node | null, 
    currentIndex: number, 
    selectedIndex: number | null
): RawNodeDatum | null => {
    if (!node && currentIndex !== selectedIndex) return null;
    
    const isSelected = currentIndex === selectedIndex;
    const isGhost = !node && isSelected;
    
    return {
        name: isGhost ? '?' : node!.index.toString(),
        attributes: {
            isSelected,
            isGhost
        },
        children: [
            nodeToTreeData(node?.leftChild ?? null, 2 * currentIndex + 1, selectedIndex),
            nodeToTreeData(node?.rightChild ?? null, 2 * currentIndex + 2, selectedIndex)
        ].filter(Boolean) as RawNodeDatum[]
    };
};

export function DataTree({ mainArr, selectedArrIndex }: DataTreeProps) {
    // Convert the first node in the array to tree data
    const treeData = mainArr[0] ? nodeToTreeData(mainArr[0], 0, selectedArrIndex) : null;

    if (!treeData) {
        return <div className="w-full h-[600px] flex items-center justify-center">No data to display</div>;
    }

    return (
        <div className="w-full h-[600px]">
            <Tree 
                data={treeData}
                orientation="vertical"
                pathFunc="step"
                collapsible={false}
                translate={{ x: 350, y: 50 }}
                separation={{ siblings: 1, nonSiblings: 1 }}
                renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
                    <g>
                        <circle
                            r={20}
                            fill={
                                nodeDatum.attributes?.isGhost 
                                    ? '#E5E7EB' 
                                    : nodeDatum.attributes?.isSelected 
                                        ? '#3B82F6' 
                                        : '#9CA3AF'
                            }
                            stroke={nodeDatum.attributes?.isSelected ? '#2563EB' : '#6B7280'}
                            strokeWidth={nodeDatum.attributes?.isSelected ? 2 : 1}
                        />
                        <text
                            dy=".35em"
                            x={0}
                            y={0}
                            textAnchor="middle"
                            style={{
                                fontSize: '12px',
                                fill: nodeDatum.attributes?.isGhost ? '#6B7280' : '#FFFFFF'
                            }}
                        >
                            {nodeDatum.name}
                        </text>
                    </g>
                )}
            />
        </div>
    );
}

export default DataTree;