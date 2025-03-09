'use client';
import {useTranslations} from "next-intl";
import React, {ChangeEvent} from "react";
interface TranslationProps {
    key: string;
    value: string;
}

export const TranslateOnServer: React.FC<TranslationProps> = ({key, value}) => {
    const t = useTranslations(key);
    return (
        <>
            {t(value)}
        </>
    );
}