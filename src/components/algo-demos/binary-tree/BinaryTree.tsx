import React, { useState } from "react";
import DataTree from "./BinaryTree.DataTree.tsx";
import ArrayDisplay from "./BinaryTree.ArrayDisplay.tsx";

interface BinaryTreeProps {
    screenWidth: number;
    screenHeight: number;
}

export function BinaryTree({ screenWidth, screenHeight }: BinaryTreeProps) {
    const [mainArr, setMainArr] = useState<number[]>([1, 3, 7, 4, 9, 8, 20, 15, 1]);

    return (
        <div className="flex flex-col">
            <ArrayDisplay 
                mainArr={mainArr}
                screenWidth={screenWidth}
                screenHeight={screenHeight}
            />
            <DataTree/>
        </div>
    );
}

export default BinaryTree;  
