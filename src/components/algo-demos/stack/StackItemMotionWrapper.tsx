import React from "react";
import { motion } from "framer-motion";

interface StackItem {
    id: number;
    value: string;
}

interface StackConfig {
    verticalSpacing: number;
    pushOffsetY: string;
    maxFloorOffset: number;
    maxBottomPosition: number;
    itemHeight: number;
    minSpacing: number;
    topItemSeparation: number;
    bottomItemSeparation: number;
    minCompressionRatio: number;
}

interface StackItemMotionWrapperProps {
    item: StackItem;
    index: number;
    stackLength: number;
    animation: any;
    config: StackConfig;
    exit?: any;
    children?: React.ReactNode;
}

export const StackItemMotionWrapper = ({
    item,
    index,
    stackLength,
    animation,
    config,
    exit,
    children,
}: StackItemMotionWrapperProps) => {

    // Calculate vertical spacing based on stack size
    const getVerticalPosition = () => {
        const maxItemsAtNormalSpacing = Math.floor(config.maxBottomPosition / config.verticalSpacing);
        
        if (stackLength <= maxItemsAtNormalSpacing) {
            // Normal spacing - evenly spaced items
            return Math.min((stackLength - index) * config.verticalSpacing, config.maxBottomPosition);
        } else {
            // Calculate available space and required spacing for compression
            const availableSpace = config.maxBottomPosition;
            const requiredSpacing = availableSpace / (stackLength - 1);
            
            // If compression would exceed minimum ratio, use minimum spacing
            const effectiveSpacing = Math.max(
                config.verticalSpacing * config.minCompressionRatio,
                requiredSpacing
            );

            // Position all items with even spacing
            return Math.min((stackLength - index) * effectiveSpacing, config.maxBottomPosition);
        }
    };

    return (
        <motion.div
            initial={false}
            animate={{ 
                opacity: 1, 
                scale: 1, 
                y: getVerticalPosition(),
                x: 0
            }}
            exit={exit}
            className="absolute top-0 w-full"
            style={{ zIndex: index + 10 }}
        >
            <motion.div
                animate={animation}
                className="h-12 w-full bg-white border-2 rounded-lg flex items-center justify-center transform-gpu preserve-3d"
            >
                <span className="text-gray-700">{children || item.value}</span>
            </motion.div>
        </motion.div>
    );
};

export default StackItemMotionWrapper; 