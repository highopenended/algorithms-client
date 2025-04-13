import React from "react";
import { motion } from "framer-motion";

interface QueueItem {
    id: number;
    value: string;
}

interface QueueConfig {
    verticalSpacing: number;
    enqueueOffsetY: string;
    maxFloorOffset: number;
    maxBottomPosition: number;
    itemHeight: number;
    minSpacing: number;
    topItemSeparation: number;
    bottomItemSeparation: number;
    minCompressionRatio: number;
}

interface QueueItemMotionWrapperProps {
    item: QueueItem;
    index: number;
    queueLength: number;
    animation: any;
    config: QueueConfig;
    exit?: any;
    children?: React.ReactNode;
}

export const QueueItemMotionWrapper = ({
    item,
    index,
    queueLength,
    animation,
    config,
    exit,
    children,
}: QueueItemMotionWrapperProps) => {
    const getHorizontalOffset = () => {
        if (queueLength <= 1) return 0;
        if (index === queueLength - 1) return "-1rem"; // Top item
        if (index === 0) return "1rem"; // Bottom item
        return 0; // Middle items
    };

    // Calculate vertical spacing based on queue size
    const getVerticalPosition = () => {
        const maxItemsAtNormalSpacing = Math.floor(config.maxBottomPosition / config.verticalSpacing);
        
        if (queueLength <= maxItemsAtNormalSpacing) {
            // Normal spacing
            return Math.min((queueLength - index) * config.verticalSpacing, config.maxBottomPosition);
        } else {
            // Calculate available space and required spacing
            const availableSpace = config.maxBottomPosition - config.verticalSpacing - config.bottomItemSeparation - config.topItemSeparation;
            const middleItemCount = queueLength - 3; // Excluding top, bottom, and second-from-bottom items
            const requiredSpacing = availableSpace / middleItemCount;
            
            // If compression would exceed minimum ratio, use minimum spacing
            const effectiveSpacing = requiredSpacing < config.verticalSpacing * config.minCompressionRatio
                ? config.verticalSpacing * config.minCompressionRatio
                : requiredSpacing;

            // Position items based on their role
            if (index === 0) {
                // Bottom item
                return config.maxBottomPosition;
            } else if (index === 1) {
                // Second from bottom item
                return config.maxBottomPosition - config.bottomItemSeparation;
            } else if (index === queueLength - 1) {
                // Top item - keep it at a fixed distance from maxBottomPosition
                return config.verticalSpacing;
            } else {
                // Middle items use effective spacing
                const bottomItemsHeight = config.maxBottomPosition - config.bottomItemSeparation;
                // Calculate how many items we can show at minimum compression
                const maxVisibleMiddleItems = Math.floor(availableSpace / (config.verticalSpacing * config.minCompressionRatio));
                
                if (requiredSpacing < config.verticalSpacing * config.minCompressionRatio) {
                    // We're at max compression, show only visible items
                    if (index - 1 <= maxVisibleMiddleItems) {
                        // This item is within visible range
                        return bottomItemsHeight - (index - 1) * (config.verticalSpacing * config.minCompressionRatio);
                    } else {
                        // This item is beyond visible range, stack it with the last visible item
                        return bottomItemsHeight - maxVisibleMiddleItems * (config.verticalSpacing * config.minCompressionRatio);
                    }
                } else {
                    // Normal compression
                    return Math.min(bottomItemsHeight - (index - 1) * effectiveSpacing, config.maxBottomPosition);
                }
            }
        }
    };

    return (
        <motion.div
            initial={false}
            animate={{ 
                opacity: 1, 
                scale: 1, 
                y: getVerticalPosition(),
                x: getHorizontalOffset()
            }}
            exit={exit}
            className="absolute top-0 w-full"
            style={{ zIndex: queueLength - index + 10 }}
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

export default QueueItemMotionWrapper; 