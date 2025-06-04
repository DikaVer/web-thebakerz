'use client';
import React, { useState, useEffect, useRef } from "react";
import { Textarea, cn } from "@heroui/react";
import { useTranslations } from "next-intl";

interface ProductNotesProps {
    initialNote?: string;
    onChange: (note: string) => void;
}

export const ProductNotes: React.FC<ProductNotesProps> = ({
    initialNote = "",
    onChange
}) => {
    const [note, setNote] = useState(initialNote);
    const [charCount, setCharCount] = useState(initialNote.length);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const t = useTranslations("app/(store)/components/product-page");

    // Handle iOS Safari zoom prevention
    useEffect(() => {
        const isIOSSafari = () => {
            return /iP(ad|hone|od)/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent) && !(/(CriOS|FxiOS|OPiOS|mercury)/.test(navigator.userAgent));
        };

        if (!isIOSSafari()) return;

        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleFocus = () => {
            // Temporarily disable zoom on focus for iOS Safari only
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                const originalContent = viewport.getAttribute('content');
                viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
                
                // Restore original viewport on blur
                const handleBlur = () => {
                    if (originalContent) {
                        viewport.setAttribute('content', originalContent);
                    }
                    textarea.removeEventListener('blur', handleBlur);
                };
                
                textarea.addEventListener('blur', handleBlur, { once: true });
            }
        };

        textarea.addEventListener('focus', handleFocus);

        return () => {
            textarea.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleNoteChange = (value: string) => {
        setNote(value);
        setCharCount(value.length);
        onChange(value);
    };

    return (
        <div>
            <Textarea
                ref={textareaRef}
                label={t("notes")}
                labelPlacement={"outside"}
                placeholder={t("addNotesPlaceholder")}
                style={{
                    resize: "none",
                    fontSize: "16px" // Prevents iOS Safari auto-zoom on focus
                }}
                className="mt-2"
                classNames={{
                    inputWrapper: cn("bg-background group-data-[focus=true]:bg-background"),
                    input: cn("min-h-[40px] text-base"), // text-base is 16px in Tailwind
                }}
                value={note}
                minRows={4}
                maxRows={5}
                onValueChange={handleNoteChange}
                isInvalid={charCount > 100}
            />
            <p className="text-right text-grayText text-small px-2">
                {charCount}/100
            </p>
        </div>
    );
}; 