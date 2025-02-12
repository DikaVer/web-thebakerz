'use client';

import React, { useState } from "react";
import { backdropEffect } from "@/lib/local-variables";
import { Button } from "@/components/ui/button";
import { SigninButton } from "@/components/ui/signin-button";
import { IconHeartCrack, IconThreeDots } from "@/components/ui/icons";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody
} from "@heroui/react";

// Renamed from renderHeaderButtons to HeaderButtons
export function HeaderButtons(
    { userId }: { userId?: string }
) {
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isUnderConstructionOpen, setIsUnderConstructionOpen] = useState(false);

    return (
        <div className="flex flex-row justify-end space-x-4 mb-4">
            {/* Corrected typo from SighInRequest to SignInRequest */}
            <SignInRequest onClose={() => setIsSignInOpen(false)} isOpen={isSignInOpen} />
            <UnderConstructionDialog onClose={() => setIsUnderConstructionOpen(false)} isOpen={isUnderConstructionOpen} />
            <Dropdown backdrop="blur">
                <DropdownTrigger>
                    <Button
                        isIconOnly
                        className="px-1 cm:px-1.5 opacity-80"
                        variant="outline"
                    >
                        <IconThreeDots className="w-7.5 h-7.5 text-background" /> {/* Adjusted class names if needed */}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Static Actions">
                    <DropdownItem
                        key="new"
                        startContent={<IconHeartCrack />}
                    >
                        Under Construction
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Button
                variant='secondary'
                className="cm:text-lg w-dynamic-button h-10 cm:w-auto cm:h-auto"
                onClick={() => {
                    if (userId) {
                        setIsUnderConstructionOpen(true);
                    } else {
                        setIsSignInOpen(true);
                    }
                }}
            >
                Message Me
            </Button>
            <Button
                variant='default'
                className="cm:text-lg w-dynamic-button h-10 cm:w-auto cm:h-auto"
                onClick={() => {
                    if (userId) {
                        setIsUnderConstructionOpen(true);
                    } else {
                        setIsSignInOpen(true);
                    }
                }}
            >
                Sweet Builder
            </Button>
        </div>
    );
}

const SignInRequest: React.FC<{
    onClose: () => void,
    isOpen: boolean,
}> = ({ onClose, isOpen }) => {
    return (
        <Modal backdrop={backdropEffect} isOpen={isOpen} onClose={onClose} size='xs' shadow="lg" placement="center">
            <ModalContent>
                <ModalHeader>
                    You need to sign in to continue
                </ModalHeader>
                <ModalFooter>
                    <Button variant="outline" onPress={onClose}>
                        Explore as Guest
                    </Button>
                    <SigninButton className="text-large"/>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

const UnderConstructionDialog: React.FC<{
    onClose: () => void,
    isOpen: boolean,
}> = ({ onClose, isOpen }) => {
    return (
        <Modal backdrop={backdropEffect} isOpen={isOpen} onClose={onClose} size='xs' shadow="lg" placement="center">
            <ModalContent>
                <ModalHeader>
                    This feature is currently under construction.
                </ModalHeader>
                <ModalBody className='flex flex-row items-center'>
                    <div className="flex min-w-[96px]">
                        <IconHeartCrack className="w-24 h-24 text-primary" />
                    </div>
                    <p className="text-md text-grayText text-center">
                        We are doing our best to deliver it soon!
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" onPress={onClose}>
                        Continue to explore
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
