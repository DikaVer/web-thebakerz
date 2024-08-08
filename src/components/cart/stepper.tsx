import React, { useState } from 'react';
import { IconTrash, IconPlus, IconMinus } from "@/components/ui/icons";

interface StepperProps {
    onDelete: () => void;
    onHoverChange: (isHovering: boolean) => void;
}

const Stepper: React.FC<StepperProps> = ({ onDelete, onHoverChange }) => {
    const [count, setCount] = useState(1);

    const handleIncrement = () => setCount(count + 1);
    const handleDecrement = () => setCount(count - 1);
    const handleReset = () => onDelete();

    return (
        <div
            className="flex rounded-xl w-20 h-7 bg-grayComp justify-between items-center overflow-hidden"
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
        >
            {count === 1 ? (
                <>
                    <button onClick={handleReset} className="hover:bg-red-200 transition duration-300 focus:outline-none pl-1 py-1">
                        <IconTrash className="w-5 h-5" />
                    </button>
                    <div className="text-center">{count}</div>
                    <button onClick={handleIncrement} className="hover:bg-grayCompHover transition duration-300 focus:outline-none pr-1 py-1">
                        <IconPlus className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <>
                    <button onClick={handleDecrement} disabled={count <= 0} className="hover:bg-grayCompHover transition duration-300 focus:outline-none pl-1 py-1">
                        <IconMinus className="w-5 h-5" />
                    </button>
                    <div className="text-center">{count}</div>
                    <button onClick={handleIncrement} className="hover:bg-grayCompHover transition duration-300 focus:outline-none pr-1 py-1">
                        <IconPlus className="w-5 h-5" />
                    </button>
                </>
            )}
        </div>
    );
};

export default Stepper;
