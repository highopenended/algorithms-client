import BinaryTree from "./BinaryTree.tsx";
import Stack from "./Stack.tsx";
import { AlgoRegistry } from "../../types/algo.types.ts";
import Queue from "./Queue.tsx";

export const algoRegistry: AlgoRegistry = [
    { name: "Binary Tree", component: BinaryTree },
    { name: "Queue", component: Queue },
    { name: "Stack", component: Stack },
].sort((a, b) => a.name.localeCompare(b.name));
  
export default algoRegistry;