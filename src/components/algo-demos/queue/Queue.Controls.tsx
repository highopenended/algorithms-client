import React from "react";
import { motion } from "framer-motion";

interface ControlsProps {
    inputValue: string;
    isInputShaking: boolean;
    isAnimatingEnqueue: boolean;
    onInputChange: (value: string) => void;
    onInputKeyDown: (e: React.KeyboardEvent) => void;
    onEnqueue: () => void;
    onDequeue: () => void;
    onPeek: () => void;
    isButtonDisabled: (action: "Enqueue" | "Dequeue" | "Peek") => boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * Controls component for Queue operations
 * Handles input field and action buttons (Enqueue, Dequeue, Peek)
 */
export function Controls({
    inputValue,
    isInputShaking,
    isAnimatingEnqueue,
    onInputChange,
    onInputKeyDown,
    onEnqueue,
    onDequeue,
    onPeek,
    isButtonDisabled,
    inputRef
}: ControlsProps) {
    return (
        <div className="flex flex-col gap-4 mb-6 items-center w-full max-w-lg">
            <motion.input
                ref={inputRef}
                type="text"
                value={inputValue}
                maxLength={30}
                animate={isInputShaking ? {
                    x: [0, -5, 5, -5, 5, 0],
                    transition: { duration: 0.3 }
                } : {}}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={onInputKeyDown}
                disabled={isAnimatingEnqueue}
                className="px-4 py-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 text-center w-full"
                placeholder="Enter value..."
            />
            <div className="flex justify-center gap-2 w-full">
                <button
                    onClick={onEnqueue}
                    disabled={isButtonDisabled("Enqueue")}
                    className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition-colors disabled:opacity-50 flex-1 min-w-[5rem]"
                >
                    Enqueue
                </button>
                <button
                    onClick={onDequeue}
                    disabled={isButtonDisabled("Dequeue")}
                    className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors disabled:opacity-50 flex-1 min-w-[5rem]"
                >
                    Dequeue
                </button>
                <button
                    onClick={onPeek}
                    disabled={isButtonDisabled("Peek")}
                    className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition-colors disabled:opacity-50 flex-1 min-w-[5rem]"
                >
                    Peek
                </button>
            </div>
        </div>
    );
}

export default Controls; 