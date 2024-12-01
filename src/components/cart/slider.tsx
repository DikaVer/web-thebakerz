import React from 'react';
import {Slider} from "@nextui-org/slider";

interface SliderProps {
    product_id: string;
    productName: string;
    onUpdate: (id: string, amount: number) => void;
    amount: number;
}

const SliderStepper: React.FC<SliderProps> = ({ product_id, productName, onUpdate, amount }) => {


    return (
        <div
        >
            <Slider
                label={`${productName} to buy`}
                size="lg"
                color={"secondary"}
                defaultValue={amount}
                minValue={1}
                maxValue={100}
                getValue={(items) => `${items} of 100 ${productName}`}
                onChangeEnd={(value) => onUpdate(product_id, value as number)}
                className="max-w-full"
            />

        </div>
    );
};

export default SliderStepper;
