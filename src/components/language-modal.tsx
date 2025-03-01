// LanguageModal.tsx (client component)
'use client';
import {Modal, ModalContent, ModalHeader, ModalBody, Button} from '@heroui/react';
import { useState, FormEvent } from 'react';
import {setLanguageCookie} from "@/lib/actions/language";
import { useRouter } from 'next/navigation';
import {Locale} from "@/lib/i18n";
import { Icon } from '@iconify/react';



export default function LanguageModal({handAction}: {handAction?: () => void}) {
    // get from server or browser
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const onClose = () => {
        setIsOpen(false);
        router.refresh();
    }



    const handleSubmit = async (targetLanguage: Locale) => {
        // Call the server action to set cookie, then close modal
        await setLanguageCookie(targetLanguage);
        // Optionally, trigger a refresh or redirect handled in the action
        handAction && handAction();
        onClose();

    };

    return (
        <Modal
            isOpen={isOpen}
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            hideCloseButton
            backdrop={'blur'}
            placement={'center'}
            size={'xs'}
        >
            <ModalContent>
                <ModalHeader>Select Language</ModalHeader>
                <ModalBody
                    className={'mb-4'}
                >
                    <Button
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0'}
                        type={'button'}
                        startContent={<Icon icon="circle-flags:lang-en" width={32}/>}
                        onPress={(e) => {
                            handleSubmit('en')
                        }}
                    >
                        English
                    </Button>
                    <Button
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0'}
                        startContent={<Icon icon="circle-flags:lang-nl" width={32}/>}
                        onPress={(e) => {
                            handleSubmit('nl')
                        }}
                    >
                        Dutch
                    </Button>
                    <Button
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0'}
                        startContent={<Icon icon="circle-flags:lang-de" width={32}/>}
                        onPress={(e) => {
                            handleSubmit('de')
                        }}
                    >
                        German
                    </Button>
                    <Button
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0'}
                        startContent={<Icon icon="circle-flags:lang-fr" width={32}/>}
                        onPress={(e) => {
                            handleSubmit('fr')
                        }}
                    >
                        French
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
