import BinaryTree from "./BinaryTree.tsx";
import Stack from "./Stack.tsx";
import { AlgoRegistry } from "../../types/algo.types.ts";

export const algoRegistry: AlgoRegistry = [
    { name: "Stack", component: Stack },
    { name: "Binary Tree", component: BinaryTree },
];
  
export default algoRegistry;