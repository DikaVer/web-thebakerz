'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardBody, addToast } from "@heroui/react";
import { useForm } from 'react-hook-form';
import { isEqual } from 'lodash';
import { useTranslations } from 'next-intl';
import { useSession } from '@/components/providers/session-provider';
import ProductsTab from './tabs/products-tab';
import PromotionsTab from './tabs/promotions-tab';
import LoyaltyTab from './tabs/loyalty-tab';
import { 
  PromotionGroup, 
  ProductPromotionAssignment 
} from '@/lib/utils/schemas/promotion-schema';
import { LoyaltySettings, LoyaltyItem, ProductLoyaltyItemAssignment } from '@/lib/utils/schemas/loyalty-schema';
import { 
  updateProductPromotionAssignments 
} from '@/lib/actions/promotions';
import { 
  updateProductLoyaltyItemAssignments 
} from '@/lib/actions/loyalty';
import { ProductDataFull, ProductData } from '@/lib/actions/product';

interface PromotionManagerProps {
  storeId: string;
  userId: string;
  productsData: ProductDataFull;
  productsOrder: Record<string, string[]>;
  initialPromotionGroups: PromotionGroup[];
  initialProductAssignments: ProductPromotionAssignment[];
  initialLoyaltySettings?: LoyaltySettings;
  initialLoyaltyItems?: LoyaltyItem[];
  initialLoyaltyAssignments?: ProductLoyaltyItemAssignment[];
}

export default function PromotionManager({
  storeId,
  userId,
  productsData,
  productsOrder,
  initialPromotionGroups,
  initialProductAssignments,
  initialLoyaltySettings,
  initialLoyaltyItems = [],
  initialLoyaltyAssignments = []
}: PromotionManagerProps) {
  const t = useTranslations('PromotionSettings');
  const { registerSaveHandler, unregisterSaveHandler, setSaveOpen } = useSession();
  const [activeTab, setActiveTab] = useState('products');
  const [promotionGroups, setPromotionGroups] = useState(initialPromotionGroups);
  const [loyaltySettings, setLoyaltySettings] = useState(initialLoyaltySettings);
  const [loyaltyItems, setLoyaltyItems] = useState(initialLoyaltyItems);
  const [saving, setSaving] = useState(false);

  // Form for product assignments
  const assignmentForm = useForm<{ assignments: ProductPromotionAssignment[]; loyaltyAssignments: ProductLoyaltyItemAssignment[] }>({
    defaultValues: {
      assignments: initialProductAssignments,
      loyaltyAssignments: initialLoyaltyAssignments
    }
  });

  const watchedAssignments = assignmentForm.watch('assignments');
  const watchedLoyaltyAssignments = assignmentForm.watch('loyaltyAssignments');

  // Check if form is dirty
  useEffect(() => {
    const promotionsDirty = !isEqual(watchedAssignments, initialProductAssignments);
    const loyaltyDirty = !isEqual(watchedLoyaltyAssignments, initialLoyaltyAssignments);
    const isDirty = promotionsDirty || loyaltyDirty;
    setSaveOpen(isDirty);
  }, [watchedAssignments, watchedLoyaltyAssignments, initialProductAssignments, initialLoyaltyAssignments, setSaveOpen]);

  // Save handler for product assignments
  const handleSaveAssignments = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const formData = assignmentForm.getValues();
      
      // Save promotion assignments
      const promotionResult = await updateProductPromotionAssignments({
        storeId,
        assignments: formData.assignments
      });

      // Save loyalty assignments
      const loyaltyResult = await updateProductLoyaltyItemAssignments({
        storeId,
        assignments: formData.loyaltyAssignments || []
      });

      if (promotionResult.success && loyaltyResult.success) {
        addToast({
          title: t('assignmentsSaved'),
          color: "success"
        });
        assignmentForm.reset(formData);
        setSaveOpen(false);
      } else {
        const errorMessage = promotionResult.error || loyaltyResult.error || t('saveFailed');
        addToast({
          title: errorMessage,
          color: "danger"
        });
      }
    } catch (error) {
      addToast({
        title: t('saveFailed'),
        color: "danger"
      });
    } finally {
      setSaving(false);
    }
  };

  // Register save handler
  useEffect(() => {
    if (activeTab === 'products') {
      registerSaveHandler('promotion-assignments', async () => {
        await handleSaveAssignments();
        return true;
      });
      return () => {
        unregisterSaveHandler('promotion-assignments');
      };
    }
  }, [activeTab, registerSaveHandler, unregisterSaveHandler]);

  // Handle promotion group updates from the Promotions tab
  const handlePromotionGroupsUpdate = (updatedGroups: PromotionGroup[]) => {
    setPromotionGroups(updatedGroups);
  };

  // Handle loyalty settings updates from the Loyalty tab
  const handleLoyaltySettingsUpdate = (updatedSettings: LoyaltySettings) => {
    setLoyaltySettings(updatedSettings);
  };

  // Handle loyalty items updates from the Loyalty tab
  const handleLoyaltyItemsUpdate = (updatedItems: LoyaltyItem[]) => {
    setLoyaltyItems(updatedItems);
  };

  // Convert ProductDataFull object to array for ProductsTab
  const productsArray = Object.values(productsData);

  return (
    <div className="mt-6">
      <Tabs 
        aria-label="Promotion tabs" 
        color="primary" 
        variant="underlined"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        <Tab key="products" title={t('productsTab')}>
          <Card className="mt-4">
            <CardBody>
              <ProductsTab
                storeId={storeId}
                products={productsArray}
                productsOrder={productsOrder}
                promotionGroups={promotionGroups}
                loyaltyItems={loyaltyItems}
                form={assignmentForm}
              />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="promotions" title={t('promotionsTab')}>
          <Card className="mt-4">
            <CardBody>
              <PromotionsTab
                storeId={storeId}
                promotionGroups={promotionGroups}
                onUpdate={handlePromotionGroupsUpdate}
              />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="loyalty" title={t('loyaltyTab')}>
          <Card className="mt-4">
            <CardBody>
              <LoyaltyTab
                storeId={storeId}
                userId={userId}
                initialLoyaltySettings={loyaltySettings}
                initialLoyaltyItems={loyaltyItems}
                onUpdate={handleLoyaltySettingsUpdate}
                onItemsUpdate={handleLoyaltyItemsUpdate}
              />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}