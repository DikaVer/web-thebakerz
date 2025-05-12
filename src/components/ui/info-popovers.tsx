'use client';

import React from 'react';
import { Popover, PopoverTrigger, PopoverContent, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';

interface InfoPopoverProps {
  type: 'preOrderTime' | 'deliveryWindow' | 'pickupWindow';
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({ type }) => {
  const t = useTranslations('app/(store)/components/info-popovers');

  const getContent = () => {
    switch (type) {
      case 'preOrderTime':
        return {
          title: t('preOrderTimeTitle'),
          description: t('preOrderTimeDescription'),
        };
      case 'deliveryWindow':
        return {
          title: t('deliveryWindowTitle'),
          description: t('deliveryWindowDescription'),
        };
      case 'pickupWindow':
        return {
          title: t('pickupWindowTitle'),
          description: t('pickupWindowDescription'),
        };
      default:
        return {
          title: '',
          description: '',
        };
    }
  };

  const { title, description } = getContent();

  return (
    <Popover placement="top">
      <PopoverTrigger>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="p-0 min-w-0 w-5 h-5 text-current" 
        >
          <Icon className="text-current" icon="solar:question-circle-linear" width={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-wull max-w-lg p-0">
        <div className="p-4">
          <p className="text-sm text-default-700">{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Usage example:
 * 
 * <div className="flex items-center gap-1">
 *   <span>Pre-order Time: 2 days</span>
 *   <InfoPopover type="preOrderTime" />
 * </div>
 */ 