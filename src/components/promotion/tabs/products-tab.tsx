'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Select,
  SelectItem,
  Input,
  Chip,
  Avatar
} from "@heroui/react";
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { PromotionGroup, ProductPromotionAssignment } from '@/lib/utils/schemas/promotion-schema';
import { LoyaltyItem, ProductLoyaltyItemAssignment } from '@/lib/utils/schemas/loyalty-schema';
import { ProductData } from '@/lib/actions/product';
import { Icon } from '@iconify/react/dist/iconify.js';
import { formatCurrency } from '@/lib/utils';

interface ProductsTabProps {
  storeId: string;
  products: ProductData[];
  productsOrder: Record<string, string[]>;
  promotionGroups: PromotionGroup[];
  loyaltyItems?: LoyaltyItem[];
  form: UseFormReturn<{ assignments: ProductPromotionAssignment[]; loyaltyAssignments: ProductLoyaltyItemAssignment[] }>;
}

export default function ProductsTab({
  storeId,
  products,
  productsOrder,
  promotionGroups,
  loyaltyItems = [],
  form
}: ProductsTabProps) {
  const t = useTranslations('PromotionSettings');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  
  // Drag scroll functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Extract unique categories
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    const categoryData = uniqueCategories
      .map(catId => {
        const productsInCategory = products.filter(p => p.category === catId);
        if (productsInCategory.length > 0) {
          return {
            id: catId,
            name: productsInCategory[0].category || catId,
            count: productsInCategory.length
          };
        }
        return null;
      })
      .filter(Boolean);
    setCategories(categoryData);
  }, [products]);

  // Sort products according to productsOrder
  const sortedProducts = [...products].sort((a, b) => {
    // productsOrder is Record<string, string[]>, flatten all arrays to get order
    const orderArray = productsOrder ? Object.values(productsOrder).flat() : [];
    const orderA = orderArray.indexOf(a.id);
    const orderB = orderArray.indexOf(b.id);
    if (orderA === -1 && orderB === -1) return 0;
    if (orderA === -1) return 1;
    if (orderB === -1) return -1;
    return orderA - orderB;
  });

  // Filter products
  const filteredProducts = sortedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter loyalty items that don't apply to all products (can be assigned to specific products)
  const assignableLoyaltyItems = loyaltyItems.filter(item => !item.applyToAllProducts && item.isActive);

  // Get or create assignment for a product
  const getAssignment = (productId: string) => {
    const assignments = form.watch('assignments');
    const index = assignments.findIndex(a => a.productId === productId);
    if (index === -1) {
      return { productId, promotionGroupId: null };
    }
    return assignments[index];
  };

  // Get or create loyalty assignment for a product
  const getLoyaltyAssignment = (productId: string) => {
    const loyaltyAssignments = form.watch('loyaltyAssignments') || [];
    const index = loyaltyAssignments.findIndex(a => a.productId === productId);
    if (index === -1) {
      return { productId, loyaltyItemId: null };
    }
    return loyaltyAssignments[index];
  };

  // Update assignment for a product
  const updateAssignment = (productId: string, promotionGroupId: string | null) => {
    const assignments = [...form.watch('assignments')];
    const index = assignments.findIndex(a => a.productId === productId);
    
    if (index === -1) {
      // Add new assignment
      assignments.push({ productId, promotionGroupId });
    } else {
      // Update existing assignment
      assignments[index] = { productId, promotionGroupId };
    }
    
    form.setValue('assignments', assignments, { shouldDirty: true });
  };

  // Update loyalty assignment for a product
  const updateLoyaltyAssignment = (productId: string, loyaltyItemId: string | null) => {
    const loyaltyAssignments = [...(form.watch('loyaltyAssignments') || [])];
    const index = loyaltyAssignments.findIndex(a => a.productId === productId);
    
    if (index === -1) {
      // Add new assignment
      loyaltyAssignments.push({ productId, loyaltyItemId });
    } else {
      // Update existing assignment
      loyaltyAssignments[index] = { productId, loyaltyItemId };
    }
    
    form.setValue('loyaltyAssignments', loyaltyAssignments, { shouldDirty: true });
  };

  // Get promotion display info
  const getPromotionDisplay = (promotionGroup: PromotionGroup | null) => {
    if (!promotionGroup) return null;
    
    if (promotionGroup.promotionDetails.type === 'discount') {
      return `${promotionGroup.promotionDetails.percentage}% ${t('off')}`;
    } else {
      const { buyQuantity, getQuantity } = promotionGroup.promotionDetails;
      return `${t('buy')} ${buyQuantity} ${t('get')} ${getQuantity} ${t('free')}`;
    }
  };

  // Get loyalty item display info
  const getLoyaltyItemDisplay = (loyaltyItem: LoyaltyItem | null) => {
    if (!loyaltyItem) return null;
    
    if (loyaltyItem.type === 'buyXGetYFree') {
      return `${t('buy')} ${loyaltyItem.buyQuantity} ${t('get')} ${loyaltyItem.getQuantity} ${t('free')}`;
    } else if (loyaltyItem.type === 'percentageDiscount') {
      return `${loyaltyItem.discountPercentage}% ${t('off')}`;
    } else if (loyaltyItem.type === 'fixedAmountDiscount') {
      return `${formatCurrency(loyaltyItem.discountAmount!)} ${t('off')}`;
    }
    return loyaltyItem.title;
  };

  // Drag scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleCategoryClick = (category: string) => {
    // Only change tab if we're not dragging
    if (!isDragging) {
      setSelectedCategory(category);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          className="flex-1"
          placeholder={t('searchProducts')}
          startContent={<Icon icon={"material-symbols:search-rounded"} />}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
      </div>

      {/* Category Tabs */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-x-4 overflow-x-auto scrollbar-hide w-full cursor-grab active:cursor-grabbing select-none p-2 border-b border-default-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        <button
          type="button"
          onClick={() => handleCategoryClick('all')}
          className={`text-sm relative whitespace-nowrap flex-shrink-0 py-2 px-4 rounded-full transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-primary text-primary-foreground font-medium' 
              : 'text-default-500 hover:text-default-700'
          }`}
        >
          {`${t('allProducts')} (${products.length})`}
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryClick(category.id)}
            className={`text-sm relative whitespace-nowrap flex-shrink-0 py-2 px-4 rounded-full transition-colors ${
              selectedCategory === category.id 
                ? 'bg-primary text-primary-foreground font-medium' 
                : 'text-default-500 hover:text-default-700'
            }`}
          >
            {`${category.name} (${category.count})`}
          </button>
        ))}
      </div>

      {/* Products Table */}
      <Table aria-label="Products table" className="mt-4">
        <TableHeader>
          <TableColumn>{t('product')}</TableColumn>
          <TableColumn>{t('price')}</TableColumn>
          <TableColumn>{t('currentPromotion')}</TableColumn>
          <TableColumn>{t('assignPromotion')}</TableColumn>
          <TableColumn>
            {assignableLoyaltyItems.length > 0 ? t('assignLoyaltyItem') : ''}
          </TableColumn>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => {
            const assignment = getAssignment(product.id);
            const loyaltyAssignment = getLoyaltyAssignment(product.id);
            const currentPromotion = promotionGroups.find(g => g.id === assignment.promotionGroupId);
            const currentLoyaltyItem = assignableLoyaltyItems.find(l => l.id === loyaltyAssignment.loyaltyItemId);
            
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={product.picture}
                      alt={product.name}
                      className="w-10 h-10"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">€{(product.price / 100).toFixed(2)}</p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {currentPromotion && (
                      <Chip
                        color={currentPromotion.isActive ? "success" : "default"}
                        variant="flat"
                        size="sm"
                      >
                        {getPromotionDisplay(currentPromotion)}
                      </Chip>
                    )}
                    {currentLoyaltyItem && (
                      <Chip
                        color="primary"
                        variant="flat"
                        size="sm"
                      >
                        {getLoyaltyItemDisplay(currentLoyaltyItem)}
                      </Chip>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    placeholder={t('selectPromotion')}
                    selectedKeys={assignment.promotionGroupId ? [assignment.promotionGroupId] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      updateAssignment(product.id, selectedKey || null);
                    }}
                    className="max-w-xs"
                  >
                    <SelectItem key="">
                      {t('noPromotion')}
                    </SelectItem>
                    {promotionGroups.map((group) => (
                      <SelectItem 
                        key={group.id!} 
                        textValue={group.name}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{group.name}</span>
                          <span className="text-small text-default-500">
                            {getPromotionDisplay(group)}
                          </span>
                        </div>
                      </SelectItem>
                    )) as any}
                  </Select>
                </TableCell>
                <TableCell>
                  {assignableLoyaltyItems.length > 0 ? (
                    <Select
                      placeholder={t('selectLoyaltyItem')}
                      selectedKeys={loyaltyAssignment.loyaltyItemId ? [loyaltyAssignment.loyaltyItemId] : []}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;
                        updateLoyaltyAssignment(product.id, selectedKey || null);
                      }}
                      className="max-w-xs"
                    >
                      <SelectItem key="">
                        {t('noLoyaltyItem')}
                      </SelectItem>
                      {assignableLoyaltyItems.map((item) => (
                        <SelectItem 
                          key={item.id!} 
                          textValue={item.title}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-small text-default-500">
                              {getLoyaltyItemDisplay(item)}
                            </span>
                          </div>
                        </SelectItem>
                      )) as any}
                    </Select>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-default-500">
          {t('noProductsFound')}
        </div>
      )}
    </div>
  );
}