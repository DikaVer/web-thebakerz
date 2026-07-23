/**
 * @fileoverview Call-to-action button for joining TheBakerz as a partner.
 *
 * Exports JoinButton, which navigates to the become-partner page (or smooth
 * scrolls to the join-thebakerz section when already there), shows a loading
 * state, and picks a shorter translated label on small screens.
 */
"use client";

import {Button} from '@heroui/react'
import * as React from "react";
import {usePathname, useRouter} from "next/navigation";
import {pacifico} from "@/components/fonts";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import { useMediaQuery } from 'usehooks-ts';

interface JoinButtonProps {
    className?: string;
}

export const JoinButton = ({ className}: JoinButtonProps) => {
    // Router and pathname for navigation
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setLoading] = useState(false);
    const t = useTranslations("app/(components)/join-button");
    const isSmallScreen = useMediaQuery("(max-width: 600px)");

    // Smooth scroll to the join-thebakerz section
    const handleSignIn = () => {
        setLoading(true);
        
        // Check if we're already on the become-partner page
        if (pathname.includes('/become-partner')) {
            // If on the same page, scroll smoothly to the element
            const element = document.getElementById('join-thebakerz');
            if (element) {
                element?.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Navigate to the page first, then scroll after page load
            router.push('/become-partner');
            // We'll rely on useEffect to handle the scroll after navigation
        }
        
        setLoading(false);
    };

    // Effect to scroll to the section if the URL has the hash
    useEffect(() => {
        if (pathname.includes('/become-partner')) {
            const hash = window.location.hash;
            if (hash === '#join-thebakerz') {
                setTimeout(() => {
                    const element = document.getElementById('join-thebakerz');
                    if (element) {
                        element?.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        }
    }, [pathname]);

    return (
        <Button
            aria-label="Join the Bakerz"
            isLoading={isLoading}
            disabled={isLoading}
            className={`${isLoading ? "px-6" : "px-4"} text-white bg-gradient-primary text-large shadow-xl rounded-3xl ${className}`}
            onPress={handleSignIn}
        >
            {isLoading ? t("loading") : isSmallScreen ? t("joinSmall") : t("join")}
        </Button>
    );
}