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
                isIconOnly
                className="h-5 w-5 min-w-5 bg-background p-0 text-default-500"
                radius="full"
                size="sm"
                variant="bordered"
                onPress={() => {
                    if (fileRef.current) {
                        fileRef.current.click();
                        onUpload();
                    }
                }}
            >
                <Icon className="h-[9px] w-[9px]" icon="solar:pen-linear" />
            </Button>
        </form>
    );
};

export default ImageForm;
