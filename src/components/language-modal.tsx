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
    const [isOpen, setIsOpen] = useState(true);

    const handleSubmit = async (targetLanguage: Locale) => {
        // Call the server action to set cookie, then close modal
        await setLanguageCookie(targetLanguage);
        // Optionally, trigger a refresh or redirect handled in the action
        handAction && handAction();
        setIsOpen(false);
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
                <ModalHeader
                >
                    Select Language
                </ModalHeader>
                <ModalBody
                    className={'mb-4 '}
                >
                    <Button
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}
                        type={'button'}
                        startContent={<Icon icon="circle-flags:lang-en-us" width={32}/>}
                        onPress={(e) => {
                            handleSubmit('en-NL')
                        }}
                    >
                        English
                    </Button>
                    {/*<Button*/}
                    {/*    variant={'light'}*/}
                    {/*    size={'lg'}*/}
                    {/*    className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}*/}
                    {/*    startContent={<div className={'w-8'}><Icon icon="circle-flags:lang-nl" width={32}/></div>}*/}
                    {/*    onPress={(e) => {*/}
                    {/*        handleSubmit('nl')*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <div className={'flex flex-col items-start'}>*/}
                    {/*        <p>Nederlands</p>*/}
                    {/*        <p className={'text-xs text-default-500'}>Kan fouten bevatten in de vertaling</p>*/}
                    {/*    </div>*/}
                    {/*</Button>*/}
                    {/*<Button*/}
                    {/*    variant={'light'}*/}
                    {/*    size={'lg'}*/}
                    {/*    className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}*/}
                    {/*    startContent={<Icon icon="circle-flags:lang-de" width={32}/>}*/}
                    {/*    onPress={(e) => {*/}
                    {/*        handleSubmit('de')*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    German*/}
                    {/*</Button>*/}
                    {/*<Button*/}
                    {/*    variant={'light'}*/}
                    {/*    size={'lg'}*/}
                    {/*    className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}*/}
                    {/*    startContent={<div className={'w-8'}><Icon icon="circle-flags:lang-fr" width={32}/></div>}*/}
                    {/*    onPress={(e) => {*/}
                    {/*        handleSubmit('fr')*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <div className={'flex flex-col items-start'}>*/}
                    {/*        <p>French</p>*/}
                    {/*        <p className={'text-xs text-default-500'}>Peut contenir des erreurs de traduction</p>*/}
                    {/*    </div>*/}
                    {/*</Button>*/}
                    {/*<Button*/}
                    {/*    variant={'light'}*/}
                    {/*    size={'lg'}*/}
                    {/*    className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}*/}
                    {/*    startContent={<Icon icon="circle-flags:lang-es" width={32}/>}*/}
                    {/*    onPress={(e) => {*/}
                    {/*        handleSubmit('es')*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    España*/}
                    {/*</Button>*/}
                    {/*<Button*/}
                    {/*    variant={'light'}*/}
                    {/*    size={'lg'}*/}
                    {/*    className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}*/}
                    {/*    startContent={<Icon icon="circle-flags:lang-uk" width={32}/>}*/}
                    {/*    onPress={(e) => {*/}
                    {/*        handleSubmit('uk')*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    Українській*/}
                    {/*</Button>*/}
                    {process.env.NEXT_PUBLIC_RUSSIAN_LANGUAGE &&
                            <Button
                            variant={'light'}
                            size={'lg'}
                            className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}
                            startContent={<Icon icon="circle-flags:lang-ru" width={32}/>}
                            onPress={(e) => {
                                handleSubmit('ru')
                            }}
                        >
                            Русский
                        </Button>
                    }
                    {/*<Button*/}
                    {/*    variant={'light'}*/}
                    {/*    size={'lg'}*/}
                    {/*    className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}*/}
                    {/*    startContent={<Icon icon="circle-flags:lang-ro" width={32}/>}*/}
                    {/*    onPress={(e) => {*/}
                    {/*        handleSubmit('ro')*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    Romanian*/}
                    {/*</Button>*/}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
