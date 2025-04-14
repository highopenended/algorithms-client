import React, { useState } from "react";
import DataTree from "./BinaryTree.DataTree.tsx";
import ArrayDisplay from "./BinaryTree.ArrayDisplay.tsx";
import { Node, NodeArray } from "./BinaryTree.types";
import { AlgoComponentProps } from "../../../types/algo.types";

// Helper function to create a sample tree
const createSampleTree = (): NodeArray => {
    const root: Node = {
        index: 1,
        leftChild: {
            index: 3,
            leftChild: {
                index: 7,
                leftChild: null,
                rightChild: null
            },
            rightChild: {
                index: 4,
                leftChild: null,
                rightChild: null
            }
        },
        rightChild: {
            index: 9,
            leftChild: {
                index: 8,
                leftChild: null,
                rightChild: null
            },
            rightChild: null
        }
    };

    // Convert the tree to an array representation
    const array: NodeArray = [];
    const queue: (Node | null)[] = [root];
    
    while (queue.length > 0) {
        const node = queue.shift() ?? null;
        array.push(node);
        if (node) {
            queue.push(node.leftChild);
            queue.push(node.rightChild);
        }
    }

    return array;
};

export function BinaryTree({ screenWidth, screenHeight }: AlgoComponentProps) {
    const [mainArr, setMainArr] = useState<NodeArray>(createSampleTree());
    const [selectedArrIndex, setSelectedArrIndex] = useState<number | null>(null);

    return (
        <div className="flex flex-col">
            <ArrayDisplay 
                mainArr={mainArr}
                screenWidth={screenWidth}
                screenHeight={screenHeight}
                selectedArrIndex={selectedArrIndex}
                onSelectIndex={setSelectedArrIndex}
            />
            <DataTree 
                mainArr={mainArr} 
                selectedArrIndex={selectedArrIndex}
                onNodeClick={setSelectedArrIndex}
            />
        </div>
    );
}

export default BinaryTree;  
