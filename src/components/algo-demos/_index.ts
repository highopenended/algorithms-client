import BinaryTree from "./BinaryTree.tsx";
import Stack from "./Stack.tsx";
import { AlgoRegistry } from "../../types/algo.types.ts";
import Queue from "./Queue.tsx";

export const algoRegistry: AlgoRegistry = [
    { name: "Stack", component: Stack },
    { name: "Binary Tree", component: BinaryTree },
    { name: "Queue", component: Queue },
];
  
export default algoRegistry;