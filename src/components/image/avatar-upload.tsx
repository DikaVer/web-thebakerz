// avatar-upload.tsx
'use client';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import CropEasy from "@/components/image/crop/crop-easy";

interface AvatarImageUploaderProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | undefined;
    setFile: (files: File) => void;
    setAvatarUrl: (url: string) => void;
}

export function AvatarImageUploader({
                                        isOpen,
                                        onClose,
                                        file,
                                        setFile,
                                        setAvatarUrl
                                    }: AvatarImageUploaderProps) {
    const [isCropping, setIsCropping] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();

    // Create a preview URL from the file
    useEffect(() => {
        if (file) {
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
                                setPhotoURL={setAvatarUrl}
                                setFile={setFile}
                            />
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
