import { useDisclosure } from "@heroui/react";
import { logger } from "@/lib/logger";
import { useState } from "react";

interface DeliveryAddressModalOptions {
    initialOpen?: boolean;
    onSubmitSuccess?: () => void;
}

export const useDeliveryAddressModal = (options?: DeliveryAddressModalOptions) => {
    const { 
        initialOpen = false,
        onSubmitSuccess
    } = options || {};
    
    const disclosure = useDisclosure({ defaultOpen: initialOpen });
    const { isOpen, onOpen, onOpenChange: originalOnOpenChange, onClose } = disclosure;
    
    const [isAutocompleteFocused, setIsAutocompleteFocused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAutocompleteFocus = () => {
        setIsAutocompleteFocused(true);
        logger.debug('deliveryAddressModal', 'Address autocomplete focused');
    };
    
    const handleAutocompleteBlur = () => {
        setTimeout(() => {
            if (!document.querySelector('.pac-container:hover')) {
                setIsAutocompleteFocused(false);
                logger.debug('deliveryAddressModal', 'Address autocomplete blurred');
            }
        }, 200);
    };

    const handleSubmitStart = () => {
        setIsSubmitting(true);
        logger.debug('deliveryAddressModal', 'Form submission started');
    };

    const handleSubmitEnd = (success: boolean = false) => {
        setIsSubmitting(false);
        logger.debug('deliveryAddressModal', `Form submission ended: ${success ? 'success' : 'failed'}`);
        
        if (success) {
            onSubmitSuccess?.();
            onClose();
        }
    };

    const handleModalOpenChange = (open: boolean) => {
        logger.debug('deliveryAddressModal', `Modal handleModalOpenChange called`, {
            open,
            isAutocompleteFocused,
            isSubmitting
        });
        
        if (!open && (isAutocompleteFocused || isSubmitting)) {
            logger.debug('deliveryAddressModal', 'Preventing modal close due to submission or autocomplete focus.');
            return;
        }

        if (!open) {
            setIsAutocompleteFocused(false);
            setIsSubmitting(false);
            logger.debug('deliveryAddressModal', 'Resetting state as modal closes.');
        }

        originalOnOpenChange();
    };

    return {
        isOpen,
        onOpen,
        onClose,
        handleModalOpenChange,
        handleAutocompleteFocus,
        handleAutocompleteBlur,
        handleSubmitStart,
        handleSubmitEnd,
        isSubmitting
    };
}; 