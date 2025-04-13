import BinaryTree from "./binary-tree/BinaryTree.tsx";
import Stack from "./stack/Stack.tsx";
import Queue from "./queue/Queue.tsx";
import { AlgoRegistry } from "../../types/algo.types.ts";

export const algoRegistry: AlgoRegistry = [
    // { name: "Binary Tree", component: BinaryTree },
    { name: "Stack", component: Stack },
    { name: "Queue", component: Queue },
].sort((a, b) => a.name.localeCompare(b.name));
  
export default algoRegistry;    