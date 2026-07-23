/**
 * @fileoverview Theme-aware footer background image for the About Us page.
 *
 * Exports the FooterImage client component, which renders the TheBakerz 4K
 * background SVG and switches between the light and dark variants based on the
 * current next-themes theme.
 */
"use client";

import {Image} from "@heroui/react";
import {useTheme} from "next-themes";

export const FooterImage = () => {
    const { theme } = useTheme()
    return (
        <Image
            src={theme === "light" ? '/images/TheBakerzBack4K.svg' : '/images/TheBakerzBack4KDark.svg'}
            alt={'TheBakerz background image'}
        />
    );
}