import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

type InteractionZoneProps = {
    selectedAlgo: string | null;
    onToggleMobileView: () => void;
}

const InteractionZone = ({ selectedAlgo, onToggleMobileView }: InteractionZoneProps) => {
    const x = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-gray-100 overflow-hidden touch-pan-x"
            style={{ x }}
            initial={{ x: '100%' }}
            animate={{ x: selectedAlgo ? 0 : '100%' }}
            transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 40,
                mass: 0.8
            }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: window.innerWidth }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
                setIsDragging(false);
                const threshold = window.innerWidth * 0.2; // Reduced to 20% threshold
                if (info.offset.x > threshold) {
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
                    ${isDragging ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
                `}
            />
            
            <div className="p-4">
                {selectedAlgo ? (
                    <h2 className="text-xl font-bold mb-4">{selectedAlgo}</h2>
                ) : (
                    <p className="text-gray-500">Select an algorithm to begin</p>
                )}
            </div>
        </motion.div>
    );
};

export default InteractionZone; 