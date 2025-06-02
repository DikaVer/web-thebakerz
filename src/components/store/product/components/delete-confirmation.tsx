import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {IconClose} from "@/components/ui/icons";
import React from "react";
import {useTheme} from "next-themes";
import { useTranslations } from "next-intl";

type DeleteModalProps = {
    isOpen: boolean;
    isLoadingDelete: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function DeleteConfirmationModal({ isOpen, isLoadingDelete, onClose, onConfirm }: DeleteModalProps) {
    const { theme } = useTheme();
    const t = useTranslations("app/(store)/components/delete-confirmation");

    return (
        <Modal
            isDismissable={!isLoadingDelete}
            backdrop="blur"
            isOpen={isOpen}
            placement="center"
            size="sm"
            hideCloseButton={isLoadingDelete}
            onClose={onClose}
            classNames={{ closeButton: "p-1" }}
            closeButton={
                <div className="absolute w-full right-0">
                    <IconClose
                        size={32}
                        primaryColor={theme === "light" ? "#730c70" : "#faf4d1"}
                        secondaryColor={theme === "light" ? "#5d5d5b" : "#a3a3a3"}
                    />
                </div>
            }
        >
            <ModalContent>
                {(onCloseModal) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t("deleteConfirmation")}</ModalHeader>
                        <ModalBody>
                            <p>{t("deleteProductWarning")}</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button aria-label="Close" className="bg-gradient-primary" color="primary" isDisabled={isLoadingDelete} onPress={() => onCloseModal()}>
                                {t("close")}
                            </Button>
                            <Button aria-label="Confirm" color="danger" isLoading={isLoadingDelete} variant="light" onPress={onConfirm}>
                                {t("confirm")}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}