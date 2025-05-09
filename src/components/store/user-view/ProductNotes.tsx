'use client';
import React, { useState } from "react";
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
    const t = useTranslations("app/(store)/components/product-page");

    const handleNoteChange = (value: string) => {
        setNote(value);
        setCharCount(value.length);
        onChange(value);
    };

    return (
        <div>
            <Textarea
                label={t("notes")}
                labelPlacement={"outside"}
                placeholder={t("addNotesPlaceholder")}
                style={{resize: "none"}}
                className="mt-2"
                classNames={{
                    inputWrapper: cn("bg-background group-data-[focus=true]:bg-background"),
                    input: cn("min-h-[40px] "),
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