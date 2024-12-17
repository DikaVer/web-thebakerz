"use client";

import {Image} from "@nextui-org/react";
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