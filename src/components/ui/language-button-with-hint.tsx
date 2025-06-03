'use client';

import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { LanguageHint } from './language-hint';

interface LanguageButtonWithHintProps {
  onLanguageOpen: () => void;
  isLanguageOpen: boolean;
  showHintDelay?: number;
  autoHideDelay?: number;
}

export const LanguageButtonWithHint = ({ 
  onLanguageOpen, 
  isLanguageOpen,
  showHintDelay = 2000,
  autoHideDelay = 11000
}: LanguageButtonWithHintProps) => {
  const [showLanguageHint, setShowLanguageHint] = useState(false);

  // Show language hint after a delay on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show hint if language modal hasn't been opened yet
      if (!isLanguageOpen) {
        setShowLanguageHint(true);
      }
    }, showHintDelay);

    // Auto-hide hint after specified delay
    const autoHideTimer = setTimeout(() => {
      setShowLanguageHint(false);
    }, autoHideDelay);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, [isLanguageOpen, showHintDelay, autoHideDelay]);

  // Hide hint when language modal is opened
  useEffect(() => {
    if (isLanguageOpen) {
      setShowLanguageHint(false);
    }
  }, [isLanguageOpen]);

  return (
    <div className="flex relative items-center justify-center">
      <Button
        isIconOnly
        variant="light"
        size="sm"
        className="min-w-0 relative z-10"
        onPress={onLanguageOpen}
        aria-label="Change language"
      >
        <Icon icon="material-symbols-light:language" width={32} height={32} />
      </Button>
      
      {/* Language hint positioned relative to the button */}
      <LanguageHint 
        show={showLanguageHint} 
        onDismiss={() => setShowLanguageHint(false)} 
      />
    </div>
  );
}; 