export interface Node {
    index: number;
    leftChild: Node | null;
    rightChild: Node | null;
}

export type NodeArray = (Node | null)[]; 