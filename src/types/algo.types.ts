import { ComponentType } from 'react';

/**
 * Props that all algorithm components should accept
 */
export interface AlgoComponentProps {
    /** Available screen width for the component */
    screenWidth: number;
    /** Available screen height for the component */
    screenHeight: number;
}

/**
 * Represents an algorithm component in the registry
 */
export interface AlgoComponent {
    /** Display name of the algorithm */
    name: string;
    /** React component that implements the algorithm visualization */
    component: ComponentType<AlgoComponentProps>;
}

/**
 * Type for the algorithm registry array
 */
export type AlgoRegistry = AlgoComponent[];
    
