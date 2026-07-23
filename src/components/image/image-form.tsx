/**
 * @fileoverview Small pencil-icon button that opens a hidden file input.
 *
 * Renders a form with a hidden file input triggered by a compact edit button;
 * on selection it passes the chosen file to the parent, resets the input so
 * the same file can be re-selected, and invokes the onUpload callback.
 */
'use client';

import React, { useRef } from "react";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react";

interface ImageFormProps {
    setFile: (files: File | undefined) => void;
    onUpload: () => void;
}

const ImageForm: React.FC<ImageFormProps> = ({ setFile, onUpload }) => {
    const fileRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files || undefined;

        setFile(file ? file[0] : undefined);
        // Reset the input so the same file can be selected again if needed

        if (fileRef.current) {
            fileRef.current.value = "";
        }
        onUpload();
    };

    return (
        <form>
            <Input
                className={"hidden"}
                type="file"
                ref={fileRef}
                onChange={handleChange}
            />
            <Button
                aria-label="Upload image"
                isIconOnly
                className="h-5 w-5 min-w-5 bg-background p-0 text-foreground"
                radius="full"
                size="sm"
                variant="bordered"
                onPress={() => {
                    if (fileRef.current) {
                        fileRef.current.click();
                    }
                }}
            >
                <Icon className="h-[9px] w-[9px]" icon="solar:pen-linear" />
            </Button>
        </form>
    );
};

export default ImageForm;
