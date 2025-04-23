'use client';

import { Modal, ModalContent, ModalHeader } from "@heroui/react";
import React, { useState, useEffect } from "react";
import CropEasy from "@/components/image/crop/crop-easy";
import showErrorMessage from "@/components/toast/toast-error";
import { ImageSchema } from "@/lib/schemas";
import { useTheme } from "next-themes";
import { IconClose } from "@/components/ui/icons";
import { useTranslations } from "next-intl";

export interface AvatarImageUploaderProps {
    type: "square" | "circle";
    isOpen: boolean;
    onClose: () => void;
    file: File | undefined;
    container: string;
    setImageURL?: (file: File, url: string) => void;
}

export function ImageUploader({
                                  container,
                                  type,
                                  isOpen,
                                  onClose,
                                  file,
                                  setImageURL,
                              }: AvatarImageUploaderProps) {
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();
    const { theme } = useTheme();
    const t = useTranslations("app/(store)/components/image");

    // Create a preview URL from the file
    useEffect(() => {
        async function processFile() {
            if (!file) return;

            try {
                // Validate the file
                const validateFile = ImageSchema.safeParse(file);
                if (!validateFile.success) {
                    showErrorMessage({ error: validateFile.error.errors[0].message });
                    onClose();
                    return;
                }

                const url = URL.createObjectURL(file);
                setPreviewUrl(url);

                return () => URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error processing file:', error);
                showErrorMessage({ 
                    error: t("imageProcessingError")
                });
                onClose();
            }
        }

        processFile();
    }, [file, onClose, t]);

    return (
        <>
            <Modal
                size="md"
                isOpen={isOpen}
                onOpenChange={onClose}
                backdrop="blur"
                placement="center"
                classNames={{
                    closeButton: "p-1"
                }}
                closeButton={
                    <div className="absolute w-full right-0">
                        <IconClose
                            size={32}
                            primaryColor={theme === "light" ? "#730c70" : "#faf4d1"}
                            secondaryColor={theme === "light" ? "#5d5d5b" : "#a3a3a3"}
                        />
                        <span className="sr-only">{t("close")}</span>
                    </div>
                }
            >
                <ModalContent>
                    {(modalClose) => (
                        <>
                            <ModalHeader className="flex flex-col">
                                <p className="text-base font-medium text-default-700">{t("title")}</p>
                                <p className="mt-1 text-sm font-normal text-default-400">{t("subtitle")}</p>
                            </ModalHeader>
                            <CropEasy
                                type={type}
                                photoURL={previewUrl}
                                setOpenCrop={onClose}
                                container={container}
                                setImageURL={setImageURL}
                            />
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}