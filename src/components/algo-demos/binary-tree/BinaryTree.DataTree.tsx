import React from 'react';
import Tree from 'react-d3-tree';

// Define the type for the tree data
interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: RawNodeDatum[];
} 

const treeData: RawNodeDatum = {
  name: '3',
  children: [
    {
      name: '4',
      children: [
        { name: '7' },
        { name: '12' }
      ]
    },
    {
      name: '9',
      children: [
        { name: '10' },
        { name: '15' }
      ]
    }
  ]
};

export function DataTree() {
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