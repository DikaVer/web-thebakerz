import { useDisclosure } from "@heroui/react";
import { logger } from "@/lib/logger";
import { useState } from "react";

export const useDeliveryAddressModal = (isSubmittingAddress: boolean) => {
    const { isOpen, onOpen, onOpenChange: originalOnOpenChange } = useDisclosure();
    const [isAutocompleteFocused, setIsAutocompleteFocused] = useState(false);

    const handleAutocompleteFocus = () => {
        setIsAutocompleteFocused(true);
        logger.debug('storeSubheader', 'Address autocomplete focused');
    };
    
    const handleAutocompleteBlur = () => {
        setTimeout(() => {
            if (!document.querySelector('.pac-container:hover')) {
                setIsAutocompleteFocused(false);
                logger.debug('storeSubheader', 'Address autocomplete blurred');
            }
        }, 200);
    };

    const handleModalOpenChange = (open: boolean) => {
        logger.debug('storeSubheader', `Modal handleModalOpenChange called`, {
            open,
            isSubmitting: isSubmittingAddress,
            isAutocompleteFocused
        });
        
        if (!open && (isSubmittingAddress || isAutocompleteFocused)) {
            logger.debug('storeSubheader', 'Preventing modal close due to submission or autocomplete focus.');
            return;
        }

        if (!open) {
            setIsAutocompleteFocused(false);
            logger.debug('storeSubheader', 'Resetting isAutocompleteFocused state as modal closes.');
        }

        originalOnOpenChange();
    };

    return {
        isOpen,
        onOpen,
        handleModalOpenChange,
        handleAutocompleteFocus,
        handleAutocompleteBlur
    };
}; 