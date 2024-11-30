import React, { useState, useEffect} from 'react';

interface MenuComponentProps {
    onClose: () => void;
    isOpen: boolean;
    menuItems: React.ReactNode
}

const MenuComponent: React.FC<MenuComponentProps> = ({ onClose, isOpen, menuItems }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 500);
            return () => clearTimeout(timer);
        }

        if (isOpen) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'} ${isVisible ? 'visible' : 'invisible'}`}>
            <div className="absolute backdrop-blur-xl inset-0" onClick={onClose}/>
            <div
                className={`relative w-64 h-full bg-background shadow-lg transform transition-transform duration-700 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {menuItems}
            </div>
        </div>
    );
};


export default MenuComponent;
