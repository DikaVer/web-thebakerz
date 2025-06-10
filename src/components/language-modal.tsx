// LanguageModal.tsx (client component)
'use client';
import {Modal, ModalContent, ModalHeader, ModalBody, Button} from '@heroui/react';
import { useState, FormEvent } from 'react';
import {setLanguageCookie} from "@/lib/actions/cookies/language";
import { usePathname, useRouter } from 'next/navigation';
import {Locale} from "@/lib/i18n";
import { Icon } from '@iconify/react';



export default function LanguageModal({handAction}: {handAction?: () => void}) {
    const pathname = usePathname();
    const isSocials = pathname.includes('socials');
    // get from server or browser
    const [isOpen, setIsOpen] = useState(!isSocials);

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
            size={'sm'}
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
                        aria-label="Select English"
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
                    <Button
                        aria-label="Select Dutch"
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}
                        startContent={<div className={'w-8'}><Icon icon="circle-flags:lang-nl" width={32}/></div>}
                        onPress={(e) => {
                            handleSubmit('nl')
                        }}
                    >
                        <div className={'flex flex-col items-start'}>
                            <p>Nederlands</p>
                            <p className={'text-xs text-default-500 truncate'}>Kan fouten bevatten in de vertaling</p>
                        </div>
                    </Button>
                    <Button
                        aria-label="Select German"
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}
                        startContent={<div className={'w-8'}><Icon icon="circle-flags:lang-de" width={32}/></div>}
                        onPress={(e) => {
                            handleSubmit('de')
                        }}
                    >
                        <div className={'flex flex-col items-start'}>
                            <p>Deutsch</p>
                            <p className={'text-xs text-default-500 truncate'}>Kann Fehler in der Übersetzung enthalten</p>
                        </div>
                    </Button>
                    <Button
                        aria-label="Select French"
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}
                        startContent={<div className={'w-8'}><Icon icon="circle-flags:lang-fr" width={32}/></div>}
                        onPress={(e) => {
                            handleSubmit('fr')
                        }}
                    >
                        <div className={'flex flex-col items-start'}>
                            <p>French</p>
                            <p className={'text-xs text-default-500 truncate'}>Peut contenir des erreurs de traduction</p>
                        </div>
                    </Button>
                    <Button
                        aria-label="Select Spanish"
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}
                        startContent={<div className={'w-8'}><Icon icon="circle-flags:lang-es" width={32}/></div>}
                        onPress={(e) => {
                            handleSubmit('es')
                        }}
                    >
                        <div className={'flex flex-col items-start'}>
                            <p>España</p>
                            <p className={'text-xs text-default-500 truncate'}>Puede contener errores de traducción</p>
                        </div>
                    </Button>
                    <Button
                        aria-label="Select Russian"
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}
                        startContent={ <div className={'w-8'}><Icon icon="circle-flags:lang-ru" width={32}/></div>}
                        onPress={(e) => {
                            handleSubmit('ru')
                        }}
                    >
                        <div className={'flex flex-col items-start'}>
                            <p>Русский</p>
                            <p className={'text-xs text-default-500 truncate'}>Может содержать ошибки в переводе</p>
                        </div>
                    </Button>
                    <Button
                        aria-label="Select Ukrainian"
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}
                        startContent={<div className={'w-8'}><Icon icon="circle-flags:lang-uk" width={32}/></div>}
                        onPress={(e) => {
                            handleSubmit('uk')
                        }}
                    >
                        <div className={'flex flex-col items-start'}>
                            <p>Українській</p>
                            <p className={'text-xs text-default-500 truncate'}>Може содержать ошибки в переводе</p>
                        </div>
                    </Button>
                    {/* <Button
                        variant={'light'}
                        size={'lg'}
                        className={'justify-start px-0 data-[hover=true]:bg-background data-[hover=true]:text-lg'}
                        startContent={<div className={'w-8'}><Icon icon="circle-flags:lang-es" width={32}/></div>}
                        onPress={(e) => {
                            handleSubmit('es')
                        }}
                    >
                        <div className={'flex flex-col items-start'}>
                            <p>España</p>
                            <p className={'text-xs text-default-500 truncate'}>Puede contener errores de traducción</p>
                        </div>
                    </Button> */}

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
