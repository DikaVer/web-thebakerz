import React, {useState, useEffect, Suspense} from 'react';

import {pacifico} from "@/components/fonts";
import {Card, CardBody} from "@heroui/react";
import {ExternalLink} from "@/components/external-link";

interface NotificationComponentProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({ onClose, isOpen }) => {
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
            <div className={`absolute right-0 w-80 h-full bg-background shadow-lg transform transition-transform duration-700 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} pl-2 pr-5`}>
                <p className={`text-2xl flex justify-center items-center p-4 ${pacifico.className}`}>Notifications</p>
                <hr/>
                <Card className={'my-4'}>
                    <CardBody>
                        <p className={'mb-4'}>
                            Psst… You’ve stumbled upon something special! 🍪 We’re quietly building the first marketplace
                            connecting artisan bakers with food lovers. As one of our early discoverers, follow us
                            @thebakerz.official in Instagram to witness our journey and be the first to know when we
                            launch
                        </p>
                        <ExternalLink href={"https://www.instagram.com/thebakerz.official"} >
                            Follow us on Instagram
                        </ExternalLink>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default NotificationComponent;
