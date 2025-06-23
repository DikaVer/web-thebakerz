'use client';
import React, { ChangeEvent, useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import {useTranslations} from "next-intl";
import debounce from 'lodash.debounce';

interface ProductSearchProps {
    searchTerm: string;
    onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({ searchTerm, onSearchChange }) => {
    const t = useTranslations("app/(store)/components/product-search");
    
    // Local state for immediate input feedback
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    
    // Ref for the container to find input elements
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Update local state when external searchTerm changes
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);
    
    // --- iOS Safari zoom prevention and keyboard juggling fix for input ---
    useEffect(() => {
        const isIOSSafari = () => {
            return /iP(ad|hone|od)/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent) && !(/(CriOS|FxiOS|OPiOS|mercury)/.test(navigator.userAgent));
        };

        if (!isIOSSafari()) return;

        const handleFocus = () => {
            // Store original values
            const viewport = document.querySelector('meta[name="viewport"]');
            let originalViewportContent = '';

            if (viewport) {
                originalViewportContent = viewport.getAttribute('content') || '';
                // Prevent zoom but allow scrolling
                viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
            }

            // Gentle scroll positioning for iPhone - position input optimally without blocking scroll
            setTimeout(() => {
                const input = containerRef.current?.querySelector('input[type="text"]') as HTMLInputElement;
                if (input) {
                    // Scroll input into view with some padding from top
                    input.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                    
                    // Add a bit more space from top for better iPhone experience
                    setTimeout(() => {
                        const currentScrollY = window.scrollY;
                        const additionalOffset = 100; // Extra space from top for better visibility
                        window.scrollTo({
                            top: Math.max(0, currentScrollY - additionalOffset),
                            behavior: 'smooth'
                        });
                    }, 100);
                }
            }, 150);
            
            // Restore viewport on blur
            const handleBlur = () => {
                if (viewport && originalViewportContent) {
                    viewport.setAttribute('content', originalViewportContent);
                }
            };
            
            // Set up blur listener on the input
            const findAndAttachBlurListener = () => {
                // Find the actual input element within the Input component
                const input = containerRef.current?.querySelector('input[type="text"]') as HTMLInputElement;
                if (input) {
                    input.addEventListener('blur', handleBlur, { once: true });
                }
            };
            
            // Attach blur listener immediately or after a short delay
            findAndAttachBlurListener();
            setTimeout(findAndAttachBlurListener, 100);
        };

        // Set up focus listener on the input
        const setupFocusListener = () => {
            const input = containerRef.current?.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) {
                input.addEventListener('focus', handleFocus);
                return () => {
                    input.removeEventListener('focus', handleFocus);
                };
            }
        };

        // Try to set up listener immediately and also after a delay for dynamic content
        const cleanup1 = setupFocusListener();
        const timeoutId = setTimeout(() => {
            const cleanup2 = setupFocusListener();
            return cleanup2;
        }, 500);

        return () => {
            cleanup1?.();
            clearTimeout(timeoutId);
        };
    }, []);
    
    // Debounced callback to parent
    const debouncedOnSearchChange = useCallback(
        debounce((value: string) => {
            // Create a synthetic event object
            const syntheticEvent = {
                target: { value },
                currentTarget: { value }
            } as ChangeEvent<HTMLInputElement>;
            onSearchChange(syntheticEvent);
        }, 300),
        [onSearchChange]
    );
    
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearchTerm(value); // Immediate update for typing feedback
        debouncedOnSearchChange(value); // Debounced callback to parent
    };

    return (<div ref={containerRef} className="flex flex-row w-full justify-center">
        <Input
            className="w-full"
            classNames={{
                mainWrapper: "rounded-xl border-0",
                inputWrapper: "bg-content1",
            }}
            placeholder={t('search')}
            value={localSearchTerm}
            onChange={handleInputChange}
            type="text"
            style={{ fontSize: '16px' }} // Prevent zoom on iOS by setting font-size to 16px or larger
            startContent={
                <Icon icon="solar:magnifer-broken" width={24} className="text-default-400"/>
            }
        />
    </div>);
};
