import React, { useState, useEffect } from 'react';

interface MenuComponentProps {
    onClose: () => void;
    isOpen: boolean;
}

const MenuComponent: React.FC<MenuComponentProps> = ({ onClose, isOpen }) => {
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
        <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'} ${isVisible ? 'visible' : 'invisible'}`}>
            <div className="absolute bg-black opacity-50 inset-0" onClick={onClose}></div>
            <div className={`relative w-64 h-full bg-white shadow-lg transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <MenuItems />
            </div>
        </div>
    );
};

const MenuItems = () => (
    <>
        <MenuItem label="Home" />
        <MenuItem label="About" />
        <MenuItem label="Services" />
        <MenuItem label="Contact" />
    </>
);

const MenuItem = ({ label }: { label: string }) => (
    <p className="p-4">{label}</p>
);

export default MenuComponent;