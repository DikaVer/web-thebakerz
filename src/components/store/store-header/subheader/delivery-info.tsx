"use client";

import { useTranslations } from "next-intl";
import { MerchantDeliveryRegion } from "@/lib/actions/delivery-actions";
import { formatCurrency } from "@/lib/utils";
import { Card, CardBody, Divider, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { WorkHours } from "@/lib/actions/calendar-actions";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
interface DeliveryInfoProps {
  deliveryRegion: MerchantDeliveryRegion;
}

export default function DeliveryInfo({
  deliveryRegion,
}: DeliveryInfoProps) {
  const t = useTranslations("app/(store)/components/store-subheader");
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isCheckout = pathname.includes("/checkout");

  // Get delivery price
  const deliveryPrice = deliveryRegion.ranges?.[0]?.deliveryPriceInCents || 100000;
  const formattedDeliveryPrice = formatCurrency(deliveryPrice);

  // Get minimum order value
  const minOrderValue = deliveryRegion.ranges?.[0]?.minOrderPriceInCents || 100000;
  const formattedMinOrderValue = formatCurrency(minOrderValue);

  // Show delivery schedule information if available
  // const deliverySchedule = deliveryRegion.deliverySchedule as WorkHours | undefined;
  // const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  // const enabledDays = deliverySchedule ? 
  //   daysOfWeek.filter(day => 
  //     deliverySchedule[day as keyof WorkHours]?.isEnabled
  //   ) : [];

  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [deliveryRegion]);

  return (
    <Card shadow="none" className="h-auto overflow-hidden w-full transition-all duration-300" >
      <CardBody className="p-0 w-full">
        <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-blue-200 dark:to-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon icon="solar:scooter-linear" className="h-5 w-5 text-primary" />
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full w-40">
                <span className="text-sm font-medium dark:text-black">{deliveryRegion.name} {t("delivery")}</span>
              </Skeleton>
            </div>
            {/* <div className="flex items-center gap-1">
              <Icon icon="solar:star-linear" className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium">Premium</span>
            </div> */}
          </div>
        </div>

        <div className="p-4">
          <div className={cn("grid gap-4 mb-3", isCheckout ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-background">
              <div className="flex items-center gap-2 mb-1 h-10">
                <Icon icon="solar:dollar-minimalistic-linear" className="h-4 w-4 text-success" />
                <span className="text-xs text-default-600">{t("deliveryFee")}</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-lg font-semibold">{formattedDeliveryPrice}</span>
              </Skeleton>
            </div>
            
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-background">
              <div className="flex items-center gap-2 mb-1 h-10">
                <Icon icon="solar:cart-large-minimalistic-linear" className="h-4 w-4 text-primary" />
                <span className="text-xs text-default-600">{t("minimumOrder")}</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-lg font-semibold">{formattedMinOrderValue}</span>
              </Skeleton>
            </div>

             {/* Buyer Protection */}
             <div className="flex flex-col gap-1 p-3 rounded-lg bg-background">
              <div className="flex items-center gap-2 mb-1 h-10">
                <Icon icon="solar:shield-check-linear" className="h-5 w-5 text-foreground" />
                <span className="text-sm font-semibold">Buyer protection</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-sm text-default-600">
                  If the actual item doesn't match the listed composition, 
                  you can return it or get a refund.
                </span>
              </Skeleton>
            </div>

             {/* Cancellation Rules */}
             <div className="flex flex-col gap-1 p-3 rounded-lg bg-background">
              <div className="flex items-center gap-2 mb-1 h-10">
                <Icon icon="solar:close-circle-linear" className="h-5 w-5 text-foreground" />
                <span className="text-sm font-semibold">Cancellation rules</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-sm text-default-600">
                  You can cancel the order before preparation, the 
                  money will be fully refunded to you.
                </span>
              </Skeleton>
            </div>
          </div>


          {/*{deliverySchedule && enabledDays.length > 0 && (*/}
          {/*  <div className="mt-3">*/}
          {/*    <div className="flex items-center gap-2 mb-2">*/}
          {/*      <Icon icon="solar:clock-circle-linear" className="h-4 w-4 text-warning" />*/}
          {/*      <span className="text-sm font-medium">{t("deliveryHours")}</span>*/}
          {/*    </div>*/}
          {/*    <div className="grid grid-cols-2 gap-2 text-xs">*/}
          {/*      {enabledDays.map(day => {*/}
          {/*        const daySchedule = deliverySchedule[day as keyof WorkHours];*/}
          {/*        if (!daySchedule) return null;*/}
          {/*        */}
          {/*        return (*/}
          {/*          <div key={day} className="flex items-center justify-between p-2 rounded bg-default-50 dark:bg-default-100/5">*/}
          {/*            <span className="capitalize font-medium">{t(day)}</span>*/}
          {/*            <span className="text-default-600">*/}
          {/*              {`${daySchedule.start.hour}:${String(daySchedule.start.minute).padStart(2, '0')} - */}
          {/*               ${daySchedule.end.hour}:${String(daySchedule.end.minute).padStart(2, '0')}`}*/}
          {/*            </span>*/}
          {/*          </div>*/}
          {/*        );*/}
          {/*      })}*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*)}*/}
          
          <div className="mt-4 p-3 rounded-lg bg-success-50 dark:bg-success-900/10 border border-success/10 transform transition-all duration-300">
            <div className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="h-5 w-5 text-success" />
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-sm font-medium text-success-700 dark:text-success-500">
                  {t("addressInRange")}
                </span>
              </Skeleton>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 