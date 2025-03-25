import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {IconClose} from "@/components/ui/icons";
import React from "react";
import {useTheme} from "next-themes";

type DeleteModalProps = {
    isOpen: boolean;
    isLoadingDelete: boolean;
    onClose: () => void;
    onConfirm: () => void;
    t: (key: string) => string;
};

export function DeleteConfirmationModal({ isOpen, isLoadingDelete, onClose, onConfirm, t}: DeleteModalProps) {
    const { theme } = useTheme();
    return (
        <Modal
            isDismissable={!isLoadingDelete}
            backdrop="blur"
            isOpen={isOpen}
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
                        <ModalHeader className="flex flex-col gap-1">{t("Delete Confirmation")}</ModalHeader>
                        <ModalBody>
                            <p>{t("Delete Product Warning")}</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" isDisabled={isLoadingDelete} onPress={() => onCloseModal()}>
                                {t("Close")}
                            </Button>
                            <Button color="danger" isLoading={isLoadingDelete} variant="light" onPress={onConfirm}>
                                {t("Confirm")}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}