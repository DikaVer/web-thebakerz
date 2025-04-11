"use client";

import { useTranslations } from "next-intl";
import { MerchantDeliveryRegion } from "@/lib/actions/delivery-actions";
import { formatCurrency } from "@/lib/utils";
import { Card, CardBody, Divider, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { WorkHours } from "@/lib/actions/calendar-actions";
import { useState, useEffect } from "react";

interface DeliveryInfoProps {
  deliveryRegion: MerchantDeliveryRegion;
}

export default function DeliveryInfo({
  deliveryRegion,
}: DeliveryInfoProps) {
  const t = useTranslations("app/(store)/components/store-subheader");
  const [isLoading, setIsLoading] = useState(true);

  // Get delivery price
  const deliveryPrice = deliveryRegion.priceInCents;
  const formattedDeliveryPrice = formatCurrency(deliveryPrice);

  // Get minimum order value
  const minOrderValue = deliveryRegion.minOrderPriceInCents;
  const formattedMinOrderValue = formatCurrency(minOrderValue);

  // Show delivery schedule information if available
  const deliverySchedule = deliveryRegion.deliverySchedule as WorkHours | undefined;
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const enabledDays = deliverySchedule ? 
    daysOfWeek.filter(day => 
      deliverySchedule[day as keyof WorkHours]?.isEnabled
    ) : [];

  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [deliveryRegion]);

  return (
    <Card className="h-auto overflow-hidden transition-all duration-300 max-w-[440px]" shadow="sm">
      <CardBody className="p-0 w-[440px] max-w-[100%]">
        <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon icon="solar:scooter-linear" className="h-5 w-5 text-primary" />
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full w-40">
                <span className="text-sm font-medium">{deliveryRegion.name} {t("delivery")}</span>
              </Skeleton>
            </div>
            {/* <div className="flex items-center gap-1">
              <Icon icon="solar:star-linear" className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium">Premium</span>
            </div> */}
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="solar:dollar-minimalistic-linear" className="h-4 w-4 text-success" />
                <span className="text-xs text-default-600">{t("deliveryFee")}</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-lg font-semibold">{formattedDeliveryPrice}</span>
              </Skeleton>
            </div>
            
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="solar:cart-large-minimalistic-linear" className="h-4 w-4 text-primary" />
                <span className="text-xs text-default-600">{t("minimumOrder")}</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-lg font-semibold">{formattedMinOrderValue}</span>
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