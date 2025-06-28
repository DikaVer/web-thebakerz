'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Switch,
  Button,
  Divider,
  Chip,
  addToast,
  cn,
  NumberInput
} from "@heroui/react";
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { 
  LoyaltySettings,
  LoyaltyTier,
  LoyaltyTierName,
  defaultLoyaltyTiers,
  LoyaltyItem
} from '@/lib/utils/schemas/loyalty-schema';
import { 
  saveLoyaltySettings,
  updateLoyaltySettings
} from '@/lib/actions/loyalty';
import LoyaltyItemsManager from '../loyalty-items-manager';
import { Icon } from '@iconify/react/dist/iconify.js';

interface LoyaltyTabProps {
  storeId: string;
  initialLoyaltySettings?: LoyaltySettings;
  initialLoyaltyItems?: LoyaltyItem[];
  userId: string;
  onUpdate?: (settings: LoyaltySettings) => void;
  onItemsUpdate?: (items: LoyaltyItem[]) => void;
}

const tierConfig = {
  Bronze: { 
    color: 'default' as const,
    textClass: 'text-default-800 font-medium'
  },
  Silver: { 
    color: 'secondary' as const,
    textClass: 'text-default-700 font-medium'
  },
  Gold: { 
    color: 'warning' as const,
    textClass: 'text-warning-600 font-medium'
  },
  Platinum: { 
    color: 'primary' as const,
    textClass: 'text-primary-600 font-medium'
  }
} as const;

const tierOrder: LoyaltyTierName[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];

export default function LoyaltyTab({
  storeId,
  initialLoyaltySettings,
  initialLoyaltyItems = [],
  userId,
  onUpdate,
  onItemsUpdate
}: LoyaltyTabProps) {
  const t = useTranslations('LoyaltySettings');
  const [loading, setLoading] = useState(false);
  const [loyaltyItems, setLoyaltyItems] = useState(initialLoyaltyItems);
  
  // Initialize form with default or existing settings
  const form = useForm({
    defaultValues: {
      isActive: initialLoyaltySettings?.isActive ?? false,
      tiers: initialLoyaltySettings?.tiers ?? defaultLoyaltyTiers
    }
  });

  const { watch, setValue, getValues, reset } = form;
  const watchedIsActive = watch('isActive');
  const watchedTiers = watch('tiers');

  // Sort tiers by the predefined order
  const sortedTiers = [...watchedTiers].sort((a, b) => 
    tierOrder.indexOf(a.tierName) - tierOrder.indexOf(b.tierName)
  );

  // Update tier value
  const updateTier = (tierName: LoyaltyTierName, field: keyof LoyaltyTier, value: number) => {
    const currentTiers = getValues('tiers');
    const updatedTiers = currentTiers.map(tier => 
      tier.tierName === tierName 
        ? { ...tier, [field]: value }
        : tier
    );
    setValue('tiers', updatedTiers, { shouldDirty: true });
  };

  // Handle loyalty items updates
  const handleLoyaltyItemsUpdate = (updatedItems: LoyaltyItem[]) => {
    setLoyaltyItems(updatedItems);
    if (onItemsUpdate) {
      onItemsUpdate(updatedItems);
    }
  };

  // Validate tiers (ensure thresholds are in ascending order)
  const validateTiers = () => {
    const tiers = getValues('tiers');
    const sortedByThreshold = [...tiers].sort((a, b) => a.spendingThreshold - b.spendingThreshold);
    
    for (let i = 0; i < tiers.length; i++) {
      const tierInOrder = tierOrder.find(name => name === sortedByThreshold[i].tierName);
      const expectedTierInOrder = tierOrder[i];
      
      if (tierInOrder !== expectedTierInOrder) {
        return false;
      }
    }
    return true;
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = getValues();
      
      // Validate tier order
      if (!validateTiers()) {
        addToast({
          title: t('invalidTierOrder'),
          color: "danger"
        });
        setLoading(false);
        return;
      }

      const saveData = {
        userId,
        isActive: formData.isActive,
        tiers: formData.tiers
      };

      let result;
      if (initialLoyaltySettings?.id) {
        result = await updateLoyaltySettings(initialLoyaltySettings.id, saveData);
      } else {
        result = await saveLoyaltySettings(storeId, saveData);
      }

      if (result.success && result.data) {
        addToast({
          title: t('loyaltySettingsSaved'),
          color: "success"
        });
        
        if (onUpdate) {
          onUpdate(result.data);
        }
        
        // Reset form with new data to clear dirty state
        reset({
          isActive: result.data.isActive,
          tiers: result.data.tiers
        });
      } else {
        addToast({
          title: result.error || t('saveFailed'),
          color: "danger"
        });
      }
    } catch (error) {
      addToast({
        title: t('saveFailed'),
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format currency display
  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  // Parse currency input
  const parseCurrency = (value: string) => {
    return Math.round(parseFloat(value || '0') * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold">{t('loyaltyProgram')}</h3>
          <p className="text-default-600 mt-1">{t('loyaltyDescription')}</p>
        </div>
        <div className="flex items-center gap-4 w-full justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm">{t('programActive')}</span>
            <Switch
              isSelected={watchedIsActive}
              onValueChange={(value) => setValue('isActive', value, { shouldDirty: true })}
            />
          </div>
          <Button 
            color="primary" 
            className="bg-gradient-primary"
            startContent={<Icon icon={"material-symbols:file-save-outline-rounded"} width={24} height={24}/>}
            onPress={handleSave}
            isLoading={loading}
          >
            {t('saveSettings')}
          </Button>
        </div>
      </div>

      <Divider />

      {/* Tier Configuration */}
      <div className="space-y-4">
        <h4 className="text-medium font-semibold">{t('tierConfiguration')}</h4>
        <p className="text-small text-default-500">{t('tierConfigurationDescription')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedTiers.map((tier, index) => (
            <Card 
              key={tier.tierName} 
              className={`border-1 ${
                watchedIsActive ? 'border-primary-200' : 'border-default-200'
              }`}
            >
              <CardHeader className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Chip 
                    color={tierConfig[tier.tierName as keyof typeof tierConfig].color}
                    variant="flat"
                    className={tierConfig[tier.tierName as keyof typeof tierConfig].textClass}
                    size="lg"
                  >
                    {tier.tierName}
                  </Chip>
                  <span className="text-small text-default-500">
                    {t('tierLevel', { level: index + 1 })}
                  </span>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <NumberInput
                  label={t('spendingThreshold')}
                  placeholder="0.00"
                  value={tier.spendingThreshold / 100}
                  onValueChange={(value) => {
                    const cents = Math.round(parseFloat(value.toString()) * 100);
                    updateTier(tier.tierName, 'spendingThreshold', cents);
                  }}
                  startContent="€"
                  description={t('minimumSpendRequired')}
                  isDisabled={tier.tierName === 'Bronze'} // Bronze is always 0
                />

                <NumberInput
                  label={t('discountPercentage')}
                  placeholder="0"
                  value={tier.discountPercentage}
                  onValueChange={(value) => {
                    const percentage = parseInt(value.toString()) || 0;
                    const clampedPercentage = Math.min(100, Math.max(0, percentage));
                    updateTier(tier.tierName, 'discountPercentage', clampedPercentage);
                  }}
                  endContent="%"
                  description={t('discountOnAllProducts')}
                  min={0}
                  max={100}
                />

                {/* Preview */}
                <div className="bg-default-50 p-3 rounded-lg">
                  <p className="text-small font-medium text-default-700">
                    {t('tierPreview')}:
                  </p>
                  <p className="text-small text-default-600">
                    {tier.spendingThreshold === 0 
                      ? t('defaultTier') 
                      : t('spendAtLeast', { amount: formatCurrency(tier.spendingThreshold) })
                    }
                  </p>
                  <p className="text-small text-default-600">
                    {tier.discountPercentage === 0 
                      ? t('noDiscount')
                      : t('receiveDiscount', { percentage: tier.discountPercentage })
                    }
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Validation Warning */}
      {!validateTiers() && (
        <Card className="bg-danger-50 border-1 border-danger-200">
          <CardBody>
            <p className="text-danger text-small font-medium flex items-center gap-2">
              <Icon icon={"material-symbols:warning-outline-rounded"} width={24} height={24}/> {t('tierOrderWarning')}
            </p>
            <p className="text-danger text-small mt-1 flex items-center gap-2">
              {t('tierOrderDescription')}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Loyalty Items Section */}
      <div className="space-y-4">
        <Divider />
        <LoyaltyItemsManager
          storeId={storeId}
          loyaltyItems={loyaltyItems}
          userId={userId}
          onUpdate={handleLoyaltyItemsUpdate}
        />
      </div>

      {/* Program Status */}
      <Card className={`border-1 ${watchedIsActive ? 'border-success-200 bg-success-50' : 'border-default-200'}`}>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {watchedIsActive ? t('programEnabled') : t('programDisabled')}
              </p>
              <p className="text-small text-default-600 mt-1">
                {watchedIsActive 
                  ? t('customersEarnLoyalty') 
                  : t('enableToStartLoyalty')
                }
              </p>
            </div>
            <Chip 
              color={watchedIsActive ? 'success' : 'default'}
              variant="flat"
            >
              {watchedIsActive ? t('active') : t('inactive')}
            </Chip>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}