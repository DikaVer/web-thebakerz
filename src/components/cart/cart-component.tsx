import React, {useState, useEffect, Suspense} from 'react';
import ShopList from "@/components/cart/shop-list";
import {CartData} from "@/lib/definitions";
import StoreSkeleton from "@/components/skeletons";
import {pacifico} from "@/components/fonts";

interface CartComponentProps {
    cart: CartData;
    isOpen: boolean;
    onClose: () => void;
}

const CartComponent: React.FC<CartComponentProps> = ({ onClose, isOpen, cart }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'} ${isVisible ? 'visible' : 'invisible'}`}>
            <div className="absolute bg-black opacity-50 inset-0" onClick={onClose}></div>
            <div className={`absolute right-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-700 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <p className={`text-2xl flex justify-center items-center p-4 ${pacifico.className}`}>Delicious Cart</p>
                <hr className="mx-2" />
                {cart ? (
                    <ShopList
                        cart={cart}
                        onClose={onClose}
                    />
                ) : (
                    <p className="text-center mt-5 text-xl">Your cart is empty 🥲</p>
                )}
            </div>
        </div>
    );
};

export default CartComponent;
