import { ComponentType } from 'react';

/**
 * Represents an algorithm component in the registry
 */
export interface AlgoComponent {
    /** Display name of the algorithm */
    name: string;
    /** React component that implements the algorithm visualization */
    component: ComponentType;
}

/**
 * Type for the algorithm registry array
 */
export type AlgoRegistry = AlgoComponent[];
    
