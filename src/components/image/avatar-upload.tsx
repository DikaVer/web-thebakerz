// avatar-upload.tsx
'use client';

import { Modal, ModalContent, ModalHeader } from "@heroui/react";
import React, { useState, useEffect } from "react";
import CropEasy from "@/components/image/crop/crop-easy";

import showErrorMessage from "@/components/toast/toast-error";
import {ImageSchema} from "@/lib/schemas";

interface AvatarImageUploaderProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | undefined;
    setFile: (files: File) => void;
}

export function AvatarImageUploader({
                                        isOpen,
                                        onClose,
                                        file,
                                        setFile,
                                    }: AvatarImageUploaderProps) {
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();

    // Create a preview URL from the file
    useEffect(() => {
        if (file) {
            const formData = new FormData();
            formData.append("file", file, "avatar.webp");

            const validateFile = ImageSchema.safeParse(formData.get("file"));
            if (!validateFile.success) {
                showErrorMessage({ error: validateFile.error.errors[0].message });
                onClose();
                return ;
            }

            const url = URL.createObjectURL(file);
            setPreviewUrl(url);


            return () => URL.revokeObjectURL(url);
        }
    }, [file]);



    return (
        <>
            <Modal size="md" isOpen={isOpen} onOpenChange={onClose} backdrop="blur">
                <ModalContent>
                    {(modalClose) => (
                        <>
                            <ModalHeader className="flex flex-col">
                                <p className="text-base font-medium text-default-700">Avatar Settings</p>
                                <p className="mt-1 text-sm font-normal text-default-400">
                                    Upload or edit your current avatar
                                </p>
                            </ModalHeader>
                            <CropEasy
                                photoURL={previewUrl}
                                setOpenCrop={onClose}
                                setFile={setFile}
                            />
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
