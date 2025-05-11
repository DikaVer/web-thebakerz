import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { useTranslations } from "next-intl";

interface ProductHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProductHelpModal({ isOpen, onClose }: ProductHelpModalProps) {
    const t = useTranslations("app/(store)/components/product-page");

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" placement="center" backdrop='blur'>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {t("Basic Information Help")}
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <span className="font-medium">{t("Item Name")}:</span> <span className="font-light">{t("help.name")}</span>
                                </li>
                                <li>
                                    <span className="font-medium">{t("Price")}:</span> <span className="font-light">{t("help.price")}</span>
                                </li>
                                <li>
                                    <span className="font-medium">{t("Category")}:</span> <span className="font-light">{t("help.category")}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button className="bg-gradient-primary" color="primary" onPress={onClose}>
                        {t("Close")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export function DescriptionHelpModal({ isOpen, onClose }: ProductHelpModalProps) {
    const t = useTranslations("app/(store)/components/product-page");
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center" backdrop='blur'>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {t("Description")}
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <span className="font-light">{t("help.description")}</span>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button className="bg-gradient-primary" color="primary" onPress={onClose}>
                        {t("Close")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export function IngredientsHelpModal({ isOpen, onClose }: ProductHelpModalProps) {
    const t = useTranslations("app/(store)/components/product-page");
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center" backdrop='blur'>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {t("Ingredients")}
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <span className="font-light">{t("help.ingredients")}</span>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button className="bg-gradient-primary" color="primary" onPress={onClose}>
                        {t("Close")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export function AllergiesHelpModal({ isOpen, onClose }: ProductHelpModalProps) {
    const t = useTranslations("app/(store)/components/product-page");
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center" backdrop='blur'>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {t("Allergies")}
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <span className="font-light">{t("help.allergies")}</span>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button className="bg-gradient-primary" color="primary" onPress={onClose}>
                        {t("Close")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export function DietaryHelpModal({ isOpen, onClose }: ProductHelpModalProps) {
    const t = useTranslations("app/(store)/components/product-page");
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center" backdrop='blur'>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {t("Dietary Restrictions")}
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <span className="font-light">{t("help.dietary")}</span>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button className="bg-gradient-primary" color="primary" onPress={onClose}>
                        {t("Close")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export function VariantsHelpModal({ isOpen, onClose }: ProductHelpModalProps) {
    const t = useTranslations("app/(store)/components/product-page");
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" placement="center" backdrop='blur'>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {t("Item Options")}
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <span className="font-light">{t("help.variants")}</span>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button className="bg-gradient-primary" color="primary" onPress={onClose}>
                        {t("Close")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
} 