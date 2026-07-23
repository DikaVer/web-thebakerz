/**
 * @fileoverview Promotions tab of the store promotion manager for managing promotion groups.
 *
 * Exports the PromotionsTab component, which lists a store's promotion
 * groups as cards and provides a modal form to create or edit groups of
 * type discount (percentage off) or buyGetFree (buy X get Y free),
 * including their active state. Persists changes through the
 * createPromotionGroup, updatePromotionGroup, and deletePromotionGroup
 * server actions and reports results via toasts.
 */
'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
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
  useDisclosure,
  addToast
} from "@heroui/react";
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { 
  PromotionGroup, 
  CreatePromotionGroup,
  UpdatePromotionGroup
} from '@/lib/utils/schemas/promotion-schema';
import { 
  createPromotionGroup, 
  updatePromotionGroup, 
  deletePromotionGroup 
} from '@/lib/actions/promotions';

interface PromotionsTabProps {
  storeId: string;
  promotionGroups: PromotionGroup[];
  onUpdate: (groups: PromotionGroup[]) => void;
}

export default function PromotionsTab({
  storeId,
  promotionGroups,
  onUpdate
}: PromotionsTabProps) {
  const t = useTranslations('PromotionSettings');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editingGroup, setEditingGroup] = useState<PromotionGroup | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'discount' as 'discount' | 'buyGetFree',
    percentage: 10,
    buyQuantity: 1,
    getQuantity: 1,
    isActive: true
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'discount',
      percentage: 10,
      buyQuantity: 1,
      getQuantity: 1,
      isActive: true
    });
    setEditingGroup(null);
  };

  // Open modal for creating/editing
  const openModal = (group?: PromotionGroup) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description || '',
        type: group.promotionDetails.type,
        percentage: group.promotionDetails.type === 'discount' ? group.promotionDetails.percentage : 10,
        buyQuantity: group.promotionDetails.type === 'buyGetFree' ? group.promotionDetails.buyQuantity : 1,
        getQuantity: group.promotionDetails.type === 'buyGetFree' ? group.promotionDetails.getQuantity : 1,
        isActive: group.isActive
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
      const promotionDetails = formData.type === 'discount'
        ? {
            type: 'discount' as const,
            percentage: formData.percentage,
            description: `${formData.percentage}% ${t('off')}`
          }
        : {
            type: 'buyGetFree' as const,
            buyQuantity: formData.buyQuantity,
            getQuantity: formData.getQuantity,
            description: `${t('buy')} ${formData.buyQuantity} ${t('get')} ${formData.getQuantity} ${t('free')}`
          };

      if (editingGroup) {
        // Update existing
        const updateData: UpdatePromotionGroup = {
          name: formData.name,
          description: formData.description,
          promotionDetails,
          isActive: formData.isActive
        };

        const result = await updatePromotionGroup(editingGroup.id!, updateData);
        if (result.success && result.data) {
          const updatedGroups = promotionGroups.map(g => 
            g.id === editingGroup.id ? result.data! : g
          );
          onUpdate(updatedGroups);
          addToast({
            title: t('promotionUpdated'),
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
        const createData: CreatePromotionGroup = {
          storeId,
          name: formData.name,
          description: formData.description,
          promotionDetails,
          isActive: formData.isActive
        };

        const result = await createPromotionGroup(createData);
        if (result.success && result.data) {
          onUpdate([...promotionGroups, result.data]);
          addToast({
            title: t('promotionCreated'),
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
  const handleDelete = async (groupId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const result = await deletePromotionGroup(storeId, groupId);
      if (result.success) {
        onUpdate(promotionGroups.filter(g => g.id !== groupId));
        addToast({
          title: t('promotionDeleted'),
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

  // Get promotion display
  const getPromotionDisplay = (group: PromotionGroup) => {
    if (group.promotionDetails.type === 'discount') {
      return `${group.promotionDetails.percentage}% ${t('off')}`;
    } else {
      const { buyQuantity, getQuantity } = group.promotionDetails;
      return `${t('buy')} ${buyQuantity} ${t('get')} ${getQuantity} ${t('free')}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <p className="text-default-600">{t('promotionsDescription')}</p>
        </div>
        <div className="flex w-full justify-end">
          <Button 
            color="primary" 
            className="bg-gradient-primary"
            startContent={<Icon icon={"material-symbols:add-2-rounded"} width={24} height={24}/>}
            onPress={() => openModal()}
          >
            {t('createPromotion')}
          </Button>
        </div>
      </div>

      {/* Promotion Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotionGroups.map((group) => (
          <Card key={group.id} className="border-1 border-default-200">
            <CardHeader className="flex justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <Chip
                  size="sm"
                  color={group.isActive ? "success" : "default"}
                  variant="flat"
                >
                  {group.isActive ? t('active') : t('inactive')}
                </Chip>
              </div>
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => openModal(group)}
                >
                  <Icon icon={"material-symbols:edit-outline"} width={24} height={24}/>
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => handleDelete(group.id!)}
                >
                  <Icon icon={"material-symbols:delete-outline"} width={24} height={24}/>
                </Button>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Chip color="primary" variant="flat" size="sm">
                    {getPromotionDisplay(group)}
                  </Chip>
                </div>
                {group.description && (
                  <p className="text-small text-default-500">{group.description}</p>
                )}
                <p className="text-tiny text-default-400">
                  {t('createdAt')}: {new Date(group.createdAt!).toLocaleDateString()}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {promotionGroups.length === 0 && (
        <Card className="bg-default-50 border-1 border-dashed border-default-300">
          <CardBody className="text-center py-8">
            <p className="text-default-500 mb-4">{t('noPromotions')}</p>
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon={"material-symbols:add-2-rounded"} width={24} height={24}/>}
              onPress={() => openModal()}
            >
              {t('createFirstPromotion')}
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
                {editingGroup ? t('editPromotion') : t('createPromotion')}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label={t('promotionName')}
                    placeholder={t('enterPromotionName')}
                    value={formData.name}
                    onValueChange={(value) => setFormData({ ...formData, name: value })}
                    isRequired
                  />
                  
                  <Textarea
                    label={t('description')}
                    placeholder={t('enterDescription')}
                    value={formData.description}
                    onValueChange={(value) => setFormData({ ...formData, description: value })}
                  />

                  <Select
                    label={t('promotionType')}
                    selectedKeys={[formData.type]}
                    onSelectionChange={(keys) => {
                      const type = Array.from(keys)[0] as 'discount' | 'buyGetFree';
                      setFormData({ ...formData, type });
                    }}
                  >
                    <SelectItem key="discount">
                      {t('discountPercentage')}
                    </SelectItem>
                    <SelectItem key="buyGetFree">
                      {t('buyGetFree')}
                    </SelectItem>
                  </Select>

                  {formData.type === 'discount' ? (
                    <Input
                      type="number"
                      label={t('discountPercentage')}
                      placeholder="e.g., 25"
                      value={formData.percentage.toString()}
                      onValueChange={(value) => {
                        const num = parseInt(value) || 0;
                        setFormData({ ...formData, percentage: Math.min(99, Math.max(1, num)) });
                      }}
                      endContent="%"
                      min={1}
                      max={99}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label={t('buyQuantity')}
                        placeholder="e.g., 2"
                        value={formData.buyQuantity.toString()}
                        onValueChange={(value) => {
                          const num = parseInt(value) || 1;
                          setFormData({ ...formData, buyQuantity: Math.max(1, num) });
                        }}
                        min={1}
                      />
                      <Input
                        type="number"
                        label={t('getFreeQuantity')}
                        placeholder="e.g., 1"
                        value={formData.getQuantity.toString()}
                        onValueChange={(value) => {
                          const num = parseInt(value) || 1;
                          setFormData({ ...formData, getQuantity: Math.max(1, num) });
                        }}
                        min={1}
                      />
                    </div>
                  )}

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
                  {editingGroup ? t('update') : t('create')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}