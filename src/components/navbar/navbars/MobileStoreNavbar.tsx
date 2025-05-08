'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Popover, PopoverContent, PopoverTrigger, Badge, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSession } from "@/components/providers/session-provider";
import { useStore } from "@/components/providers/store-provider";
import ThreeDotsDropdown from "@/components/store/store-header/subheader/three-dots";
import { IconLoadingCircle } from '@/components/ui/icons';

const MobileStoreNavbar: React.FC = () => {
  const router = useRouter();
  const { session } = useSession();
  const { store } = useStore();
  const [isStorePopoverOpen, setIsStorePopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null); // Track loading state with button ID
  
  const storeUrl = store?.storeName ? store.storeName : store?.id;
  const stores = session?.stores || [];
  
  // Get current store's new orders count
  const currentStoreOrdersCount = store?.id ? 
    stores.find(s => s.id === store.id)?.newOrdersCount || 0 : 0;
  
  // Check if user has bakerz role
  const isBakerz = !!session?.user?.role && session.user.role === "bakerz";
  
  if (!isBakerz) return null; // Only show for bakerz role
  
  const handleNavigation = (path: string, id: string) => {
    setIsLoading(id);
    router.push(path);
    setTimeout(() => setIsLoading(null), 1000); // Reset loading after some time
  };
  
  return (
    <>
      <div className="flex justify-around items-center h-12">
        {/* Shop Button */}
        <Popover 
          isOpen={isStorePopoverOpen} 
          onOpenChange={setIsStorePopoverOpen} 
          placement="top"
        >
          <PopoverTrigger>
            <div className="flex flex-col items-center justify-center w-full cursor-pointer">
              <Icon
                icon="solar:shop-2-outline"
                width={24}
                className="text-default-500"
              />
              <span className="text-xs mt-1">Shop</span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="max-h-[300px] overflow-y-auto w-64">
            <div className="flex flex-col w-full gap-2 p-2">
              {stores.length > 0 ? (
                stores.map((storeItem) => (
                  <Button
                    key={storeItem.id}
                    size="sm"
                    variant={storeItem.id === store?.id ? "solid" : "light"}
                    className={cn("justify-start w-full", storeItem.id === store?.id && "bg-default-200")}
                    onPress={() => {
                      handleNavigation(`/${storeItem.name}`, `shop-${storeItem.id}`);
                      setIsStorePopoverOpen(false);
                    }}
                    isLoading={isLoading === `shop-${storeItem.id}`}
                  >
                    {storeItem.name}
                  </Button>
                ))
              ) : (
                <p className="text-xs text-default-400">No shops available</p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Orders Button */}
        <div 
          className="flex flex-col items-center justify-center w-full cursor-pointer"
          onClick={() => storeUrl && handleNavigation(`/${storeUrl}/orders`, 'orders')}
        >
          {isLoading === 'orders' ? (
            <IconLoadingCircle width={24} className="text-background-secondary" />
          ) : (
            <div className="relative inline-flex items-center justify-center">
              {currentStoreOrdersCount > 0 ? (
                <Badge color="danger" 
                    size="sm"
                    content={currentStoreOrdersCount}>
                  <Icon
                    icon="solar:document-text-outline"
                    width={24}
                    className="text-default-500"
                  />
                </Badge>
              ) : (
                <Icon
                  icon="solar:document-text-outline"
                  width={24}
                  className="text-default-500"
                />
              )}
            </div>
          )}
          <span className="text-xs mt-1">Orders</span>
        </div>

        {/* Add Item Button */}
        <div 
          className="flex flex-col items-center justify-center w-full cursor-pointer"
          onClick={() => handleNavigation(`/${storeUrl}/item/add-item`, 'add-item')}
        >
          {isLoading === 'add-item' ? (
            <IconLoadingCircle width={24} className="text-background-secondary" />
          ) : (
            <Icon
              icon="solar:add-circle-outline"
              width={24}
              className="text-default-500"
            />
          )}
          <span className="text-xs mt-1">Add Item</span>
        </div>

        {/* Settings Button */}
        <div className="flex flex-col items-center justify-center w-full">
          <ThreeDotsDropdown>
            <div className="flex flex-col items-center justify-center cursor-pointer">
              <Icon
                icon="solar:settings-outline"
                width={24}
                className="text-default-500"
              />
              <span className="text-xs mt-1">Settings</span>
            </div>
          </ThreeDotsDropdown>
        </div>
      </div>
      </>
  );
};

export default MobileStoreNavbar; 