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
}

/**
 * Converts a Node structure into a tree data format for react-d3-tree
 * @param node Node to convert
 * @returns Tree data structure
 */
const nodeToTreeData = (node: Node | null): RawNodeDatum | null => {
    if (!node) return null;
    
    return {
        name: node.index.toString(),
        children: [
            nodeToTreeData(node.leftChild),
            nodeToTreeData(node.rightChild)
        ].filter(Boolean) as RawNodeDatum[]
    };
};

export function DataTree({ mainArr }: DataTreeProps) {
    // Convert the first node in the array to tree data
    const treeData = mainArr[0] ? nodeToTreeData(mainArr[0]) : null;

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
            />
        </div>
    );
}

export default DataTree;