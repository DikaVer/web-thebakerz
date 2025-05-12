'use client';

import React, { useState } from 'react';
import { useFavorites } from '@/components/providers/favorites-provider';
import { Tabs, Tab, Card, CardFooter, CardBody, Button } from "@heroui/react";
import { useRouter } from 'next/navigation';
import { Icon } from "@iconify/react";
import Image from 'next/image';

export default function FavoritesContent() {
  const [selectedTab, setSelectedTab] = useState("stores");
  const router = useRouter();
  const { 
    storeFavorites, 
    productFavorites,
    removeStoreFromFavorites,
    removeProductFromFavorites 
  } = useFavorites();

  const handleTabChange = (key: React.Key) => {
    setSelectedTab(key.toString());
  };

  const navigateToStore = (storeId: string) => {
    router.push(`/${storeId}`);
  };

  const navigateToProduct = (storeId: string, productId?: string) => {
    if(productId) {
      router.push(`/${storeId}/item/${productId}`);
    } else {
      router.push(`/${storeId}`);
    }
  };

  return (
    <div>
      <Tabs
        aria-label="Favorites"
        selectedKey={selectedTab}
        onSelectionChange={handleTabChange}
        className="w-full"
        classNames={{
          tabList: 'bg-background',
          cursor: 'bg-white shadow-none',
        }}
      >
        <Tab key="stores" title="Stores" />
        <Tab key="products" title="Products" />
      </Tabs>

      <div className="mt-6">
        {selectedTab === "stores" ? (
          storeFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {storeFavorites.map((store) => (
                <div 
                  key={store.storeId} 
                  className="cursor-pointer relative"
                  onClick={() => navigateToStore(store.storeId)}
                >
                  <Card
                    isFooterBlurred
                    shadow="none"
                    radius="lg"
                    className="border-none"
                  >
                    <CardBody className="p-0">
                      <div className="w-full aspect-video relative">
                        <div className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md group hover:bg-white/80 transition-colors">
                          <Icon icon="solar:arrow-right-up-linear" width={20} className="text-white group-hover:text-black transition-colors" />
                        </div>
                        <Image
                          alt={store.metadata.storeName || ''}
                          className="object-cover rounded-t-lg"
                          src={store.metadata.storeBackground || '/search/store_front_clean.webp'}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                    </CardBody>
                    <CardFooter className="p-4  bg-white/60">
                      <div className="flex justify-between items-center w-full">
                        <h3 className="text-foreground font-medium">{store.metadata?.storeName || "Store"}</h3>
                        <Button
                          isIconOnly
                          variant="light"
                          radius="full"
                          size="sm"
                          className="text-foreground bg-black/60"
                          onPress={() => {
                            removeStoreFromFavorites(store.storeId);
                          }}
                        >
                          <Icon icon="solar:heart-bold" width={20} className="text-danger-500" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10">
              <Icon icon="solar:heart-linear" width={60} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">You haven't added any stores to your favorites yet.</p>
            </div>
          )
        ) : (
          productFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productFavorites.map((product) => (
                <div 
                key={`${product.storeId}-${product.productId}`} 
                className="cursor-pointer relative"
                onClick={() => navigateToProduct(product.storeId, product?.productId)}
                >
                  <Card
                    isFooterBlurred
                    radius="lg"
                    className="border-none"
                  >
                    <CardBody className="p-0">
                      <div className="w-full aspect-square relative">
                        <div className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md group hover:bg-white/80 transition-colors">
                          <Icon icon="solar:arrow-right-up-linear" width={20} className="text-white  group-hover:text-black transition-colors" />
                        </div>
                        <Image
                          alt={product.metadata.productName || ''}
                          className="object-cover rounded-t-lg"
                          src={product.metadata.productImage || '/search/store_front_clean.webp'}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                    </CardBody>
                    <CardFooter className="p-4 bg-white/60">
                      <div className="flex justify-between items-center w-full">
                        <h3 className="text-foreground font-medium">{product.metadata?.productName || "Product"}</h3>
                        <Button
                          isIconOnly
                          variant="light"
                          radius="full"
                          size="sm"
                          className="text-foreground bg-black/60"
                          onPress={() => {
                            removeProductFromFavorites(product.storeId, product.productId || '');
                          }}
                        >
                          <Icon icon="solar:heart-bold" width={20} className="text-danger-500" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10">
              <Icon icon="solar:heart-linear" width={60} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">You haven't added any products to your favorites yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
} 