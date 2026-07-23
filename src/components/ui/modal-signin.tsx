/**
 * @fileoverview Sign-in prompt modal shown to unauthenticated users.
 *
 * Exports ModalSignIn, a Hero UI modal offering "Login" (redirects to /auth
 * with the current path as the return destination) or "Not now", plus the
 * useSignInModal hook that manages open state and returns a pre-wired modal
 * component.
 */
'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';

interface ModalSignInProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const ModalSignIn = ({
  isOpen: initialOpen = false,
  onClose,
  message,
}: ModalSignInProps) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(initialOpen);
  }, [initialOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleSignIn = () => {
    router.push(`/auth?next=${pathname}`);
    handleClose();
  };

  return (
    <Modal 
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      backdrop="blur"
      size="xs"
      isDismissable={true}
    >
      <ModalContent className="px-4 py-4 rounded-xl">
        <ModalHeader className="flex flex-col gap-1 text-left p-0 mb-2">
          <h3 className="text-xl font-semibold">You need to log in</h3>
        </ModalHeader>
        <ModalBody className="p-0">
          <p className="text-gray-600 mb-5">{message}</p>
          <div className="flex w-full justify-between gap-2 mt-2">
            <Button 
              variant="light" 
              className="flex-1 border border-gray-200 hover:bg-gray-100"
              onPress={handleClose}
              aria-label="Not now"
            >
              Not now
            </Button>
            <Button 
              aria-label="Login"
              className="flex-1 bg-gradient-primary text-white border-0 hover:bg-gradient-primary/80"
              onPress={handleSignIn}
            >
              Login
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalSignIn;

// Custom hook to easily manage the sign-in modal
export const useSignInModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  return {
    isOpen,
    openModal,
    closeModal,
    ModalSign: ({ message}: Omit<ModalSignInProps, 'isOpen' | 'onClose'>) => (
      <ModalSignIn 
        isOpen={isOpen} 
        onClose={closeModal} 
        message={message}
      />
    )
  };
};
