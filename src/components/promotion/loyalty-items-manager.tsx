'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Divider,
  Chip,
  useDisclosure,
  addToast,
  NumberInput
} from "@heroui/react";
import { useTranslations } from 'next-intl';
import { 
  LoyaltyItem,
  CreateLoyaltyItem,
  UpdateLoyaltyItem,
  LoyaltyItemType
} from '@/lib/utils/schemas/loyalty-schema';
import { 
  createLoyaltyItem, 
  updateLoyaltyItem, 
  deleteLoyaltyItem 
} from '@/lib/actions/loyalty';
import { Icon } from '@iconify/react/dist/iconify.js';
import { formatCurrency } from '@/lib/utils';

interface LoyaltyItemsManagerProps {
  storeId: string;
  loyaltyItems: LoyaltyItem[];
  userId: string;
  onUpdate: (items: LoyaltyItem[]) => void;
}

export default function LoyaltyItemsManager({
  storeId,
  loyaltyItems,
  userId,
  onUpdate
}: LoyaltyItemsManagerProps) {
  const t = useTranslations('LoyaltySettings');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingItem, setEditingItem] = useState<LoyaltyItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'buyXGetYFree' as LoyaltyItemType,
    price: 0,
    isActive: true,
    applyToAllProducts: true,
    // Type-specific fields
    buyQuantity: 1,
    getQuantity: 1,
    discountPercentage: 10,
    discountAmount: 0
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'buyXGetYFree',
      price: 0,
      isActive: true,
      applyToAllProducts: true,
      buyQuantity: 1,
      getQuantity: 1,
      discountPercentage: 10,
      discountAmount: 0
    });
    setEditingItem(null);
  };

  // Open modal for creating/editing
  const openModal = (item?: LoyaltyItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        type: item.type,
        price: item.price,
        isActive: item.isActive,
        applyToAllProducts: item.applyToAllProducts,
        buyQuantity: item.buyQuantity || 1,
        getQuantity: item.getQuantity || 1,
        discountPercentage: item.discountPercentage || 10,
        discountAmount: item.discountAmount ? item.discountAmount : 0
      });
    } else {
      resetForm();
    }
    onOpen();
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    try {
      const saveData: Partial<CreateLoyaltyItem> = {
        userId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: Math.round(formData.price), // Convert to cents
        isActive: formData.isActive,
        applyToAllProducts: formData.applyToAllProducts,
      };

      // Add type-specific fields
      if (formData.type === 'buyXGetYFree') {
        saveData.buyQuantity = formData.buyQuantity;
        saveData.getQuantity = formData.getQuantity;
      } else if (formData.type === 'percentageDiscount') {
        saveData.discountPercentage = formData.discountPercentage;
      } else if (formData.type === 'fixedAmountDiscount') {
        saveData.discountAmount = Math.round(formData.discountAmount); // Convert to cents
      }

      if (editingItem) {
        // Update existing
        const result = await updateLoyaltyItem(storeId, editingItem.id!, saveData);
        if (result.success && result.data) {
          const updatedItems = loyaltyItems.map(item => 
            item.id === editingItem.id ? result.data! : item
          );
          onUpdate(updatedItems);
          addToast({
            title: t('loyaltyItemUpdated'),
            color: "success"
          });
        } else {
          addToast({
            title: result.error || t('updateFailed'),
            color: "danger"
          });
        }
      } else {
        // Create new
        const result = await createLoyaltyItem(storeId, saveData);
        if (result.success && result.data) {
          onUpdate([...loyaltyItems, result.data]);
          addToast({
            title: t('loyaltyItemCreated'),
            color: "success"
          });
        } else {
          addToast({
            title: result.error || t('createFailed'),
            color: "danger"
          });
        }
      }
      
      onOpenChange();
      resetForm();
    } catch (error) {
      addToast({
        title: t('saveFailed'),
        color: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (itemId: string) => {
    if (!confirm(t('confirmDeleteLoyaltyItem'))) return;

    try {
      const result = await deleteLoyaltyItem(storeId, userId, itemId);
      if (result.success) {
        onUpdate(loyaltyItems.filter(item => item.id !== itemId));
        addToast({
          title: t('loyaltyItemDeleted'),
          color: "success"
        });
      } else {
        addToast({
          title: result.error || t('deleteFailed'),
          color: "danger"
        });
      }
    } catch (error) {
      addToast({
        title: t('deleteFailed'),
        color: "danger"
      });
    }
  };

  // Get item type display
  const getItemTypeDisplay = (item: LoyaltyItem) => {
    if (item.type === 'buyXGetYFree') {
      return `${t('buy')} ${item.buyQuantity} ${t('get')} ${item.getQuantity} ${t('free')}`;
    } else if (item.type === 'percentageDiscount') {
      return `${item.discountPercentage}% ${t('discount')}`;
    } else if (item.type === 'fixedAmountDiscount') {
      return `${formatCurrency(item.discountAmount!)} ${t('off')}`;
    }
    return item.type;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-medium font-semibold">{t('loyaltyItems')}</h4>
          <p className="text-default-600">{t('loyaltyItemsDescription')}</p>
        </div>
        <Button 
          color="primary" 
          startContent={<Icon icon={"material-symbols:add-2-rounded"} width={24} height={24}/>}
          onPress={() => openModal()}
        >
          {t('createLoyaltyItem')}
        </Button>
      </div>

      {/* Loyalty Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loyaltyItems.map((item) => (
          <Card key={item.id} className="border-1 border-default-200">
            <CardHeader className="flex justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <Chip
                  size="sm"
                  color={item.isActive ? "success" : "default"}
                  variant="flat"
                >
                  {item.isActive ? t('active') : t('inactive')}
                </Chip>
              </div>
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => openModal(item)}
                >
                  <Icon icon={"material-symbols:edit-outline"} width={24} height={24}/>
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => handleDelete(item.id!)}
                >
                  <Icon icon={"material-symbols:delete-outline-rounded"} width={24} height={24}/>
                </Button>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Chip color="primary" variant="flat" size="sm">
                    {getItemTypeDisplay(item)}
                  </Chip>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-small text-default-500">{t('price')}:</span>
                  <span className="font-medium">{formatCurrency(item.price)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-small text-default-500">{t('applyTo')}:</span>
                  <span className="text-small">
                    {item.applyToAllProducts ? t('allProducts') : t('selectedProducts')}
                  </span>
                </div>

                {item.description && (
                  <p className="text-small text-default-500 mt-2">{item.description}</p>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {loyaltyItems.length === 0 && (
        <Card className="bg-default-50 border-1 border-dashed border-default-300">
          <CardBody className="text-center py-8">
            <p className="text-default-500 mb-4">{t('noLoyaltyItems')}</p>
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon={"material-symbols:add-2-rounded"} width={24} height={24}/>}
              onPress={() => openModal()}
            >
              {t('createFirstLoyaltyItem')}
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingItem ? t('editLoyaltyItem') : t('createLoyaltyItem')}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label={t('title')}
                    placeholder={t('enterItemTitle')}
                    value={formData.title}
                    onValueChange={(value) => setFormData({ ...formData, title: value })}
                    isRequired
                  />
                  
                  <Textarea
                    label={t('description')}
                    placeholder={t('enterDescription')}
                    value={formData.description}
                    onValueChange={(value) => setFormData({ ...formData, description: value })}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label={t('itemType')}
                      selectedKeys={[formData.type]}
                      onSelectionChange={(keys) => {
                        const type = Array.from(keys)[0] as LoyaltyItemType;
                        setFormData({ ...formData, type });
                      }}
                    >
                      <SelectItem key="buyXGetYFree">
                        {t('buyXGetYFree')}
                      </SelectItem>
                      <SelectItem key="percentageDiscount">
                        {t('percentageDiscount')}
                      </SelectItem>
                      <SelectItem key="fixedAmountDiscount">
                        {t('fixedAmountDiscount')}
                      </SelectItem>
                    </Select>

                    <NumberInput
                      label={t('price')}
                      placeholder="0.00"
                      value={formData.price / 100}
                      onValueChange={(value) => {
                        const num = (parseFloat(value.toString()) || 0) * 100;
                        setFormData({ ...formData, price: Math.max(0, num)});
                      }}
                      startContent="€"
                      min={0}
                    />
                  </div>

                  {/* Type-specific fields */}
                  {formData.type === 'buyXGetYFree' && (
                    <div className="grid grid-cols-2 gap-4">
                      <NumberInput
                        label={t('buyQuantity')}
                        placeholder="e.g., 2"
                        value={formData.buyQuantity}
                        onValueChange={(value) => {
                          const num = parseInt(value.toString()) || 1;
                          setFormData({ ...formData, buyQuantity: Math.max(1, num) });
                        }}
                        min={1}
                      />
                      <NumberInput
                        label={t('getFreeQuantity')}
                        placeholder="e.g., 1"
                        value={formData.getQuantity}
                        onValueChange={(value) => {
                          const num = parseInt(value.toString()) || 1;
                          setFormData({ ...formData, getQuantity: Math.max(1, num) });
                        }}
                        min={1}
                        max={100}
                      />
                    </div>
                  )}

                  {formData.type === 'percentageDiscount' && (
                    <NumberInput
                      label={t('discountPercentage')}
                      placeholder="e.g., 25"
                      value={formData.discountPercentage}
                      onValueChange={(value) => {
                        const num = parseInt(value.toString()) || 0;
                        setFormData({ ...formData, discountPercentage: Math.min(100, Math.max(1, num)) });
                      }}
                      endContent="%"
                      min={1}
                      max={100}
                    />
                  )}

                  {formData.type === 'fixedAmountDiscount' && (
                    <NumberInput
                      label={t('discountAmount')}
                      placeholder="5.00"
                      value={formData.discountAmount / 100}
                      onValueChange={(value) => {
                        const num = (parseFloat(value.toString()) || 0) * 100;
                        setFormData({ ...formData, discountAmount: Math.max(0, num) });
                      }}
                      startContent="€"
                      min={0}
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-medium">{t('applyToAllProducts')}</span>
                    <Switch
                      isSelected={formData.applyToAllProducts}
                      onValueChange={(value) => setFormData({ ...formData, applyToAllProducts: value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-medium">{t('isActive')}</span>
                    <Switch
                      isSelected={formData.isActive}
                      onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSave}
                  isLoading={loading}
                >
                  {editingItem ? t('update') : t('create')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}