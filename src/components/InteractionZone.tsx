import React, { useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { AlgoComponent } from "../types/algo.types";

type InteractionZoneProps = {
    selectedAlgo: AlgoComponent | null;
    onToggleMobileView: () => void;
    isMobile?: boolean;
    checkMobileView: () => void;
    screenWidth: number;
    screenHeight: number;
};

const InteractionZone = ({
    selectedAlgo,
    onToggleMobileView,
    isMobile = false,
    checkMobileView,
    screenWidth,
    screenHeight,
}: InteractionZoneProps) => {
    const x = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);

    const baseClasses = "bg-gray-100 overflow-hidden";
    const mobileClasses = "fixed inset-0 z-50 touch-pan-x";
    const desktopClasses = "flex-1";

    // Calculate available height for content (accounting for padding and other UI elements)
    const contentHeight = screenHeight - (isMobile ? 0 : 32); // 32px for padding

    if (!isMobile) {
        return (
            <div className={`${baseClasses} ${desktopClasses}`} style={{ height: contentHeight }}>
                <div className="p-4 h-full">
                    {selectedAlgo ? (
                        <>
                            <h2 className="text-xl font-bold mb-4 text-center">{selectedAlgo.name}</h2>
                            <div className="h-[calc(100%-3rem)]">
                                <selectedAlgo.component screenHeight={contentHeight - 48} screenWidth={screenWidth} />
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500">Select an algorithm to begin</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className={`${baseClasses} ${mobileClasses}`}
            style={{ x, height: contentHeight }}
            initial={{ x: "100%" }}
            animate={{ x: selectedAlgo ? 0 : "100%" }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 40,
                mass: 0.8,
            }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: screenWidth }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
                setIsDragging(false);
                const threshold = screenWidth * 0.2;
                if (info.offset.x > threshold) {
                    checkMobileView();
                    onToggleMobileView();
                } else {
                    x.set(0);
                }
            }}
        >
            {/* Drawer handle */}
            <div
                className={`
                    absolute left-0 top-1/2 -translate-y-1/2 
                    w-2 h-24 bg-gray-300 rounded-r 
                    cursor-grab active:cursor-grabbing
                    transition-opacity duration-200
                    ${isDragging ? "opacity-100" : "opacity-70 hover:opacity-100"}
                `}
            />

            <div className="p-4 h-full">
                {selectedAlgo ? (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-center">{selectedAlgo.name}</h2>
                        <div className="h-[calc(100%-3rem)]">
                            <selectedAlgo.component screenHeight={contentHeight - 48} screenWidth={screenWidth} />
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">Select an algorithm to begin</p>
                )}
            </div>
        </motion.div>
    );
};

export default InteractionZone;
