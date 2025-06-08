'use client';

import React, { useState} from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useSession } from "@/components/providers/session-provider";
import { StoreBusinessData } from "@/lib/actions/store";

interface BusinessInfoProps {
  className?: string;
  business: StoreBusinessData | null;
}

// Map of country codes to flag icons
const countryFlagMap: Record<string, string> = {
    'NL': 'circle-flags:lang-nl',
    'FR': 'circle-flags:lang-fr',
    'GB': 'circle-flags:lang-en-us',
    'BE': 'circle-flags:lang-be',
    'DE': 'circle-flags:lang-de',
    'ES': 'circle-flags:lang-es',
    'IT': 'circle-flags:lang-it',
    'US': 'circle-flags:us',
    // Default flag for unmapped countries
    'default': 'solar:map-point-linear'
  };

// Map of account types to icons and colors
const accountTypeMap: Record<string, {icon: string, color: string, name: string}> = {
  'bakerz': { icon: 'solar:shop-2-linear', color: 'text-primary', name: 'Business' },
  'admin': { icon: 'solar:shield-user-linear', color: 'text-warning', name: 'Admin' },
  'user': { icon: 'solar:user-linear', color: 'text-success', name: 'User' },
  'default': { icon: 'solar:user-linear', color: 'text-default-500', name: 'User' }
};

const BusinessInfo: React.FC<BusinessInfoProps> = ({ className, business }) => {
  const t = useTranslations("app/(return_page)/settings/components/business-info");
  const { session } = useSession();
  const isLoading = !session.user;


  if (!session.user) {
    return null;
  }

  // Get account type info
  const userRole = session.user.role || 'user';
  const accountTypeInfo = accountTypeMap[userRole] || accountTypeMap.default;

  // Format email for display
//   const hideEmail = (email: string) => {
//     const [username, domain] = email.split('@');
//     if (!username || !domain) return email;
    
//     const hiddenUsername = username.charAt(0) + 
//       '*'.repeat(Math.min(username.length - 2, 5)) + 
//       username.charAt(username.length - 1);
    
//     return `${hiddenUsername}@${domain}`;
//   };

  // Get creation date (this would come from the user object in a real implementation)
  const getFormattedDate = () => {
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

    // Get the flag icon for the country
    const flagIcon = business?.region ? countryFlagMap[business.region] : countryFlagMap.default;

  return (
    <div className="space-y-6">
      {/* Account Information Card */}
      <Card shadow="none" className={`w-full overflow-hidden transition-all duration-300 ${className}`}>
        <CardBody className="p-0 w-full">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-blue-200 dark:to-secondary-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Icon icon="solar:info-circle-linear" className="h-5 w-5 text-primary" />
                </div>
                <Skeleton isLoaded={!isLoading} className="rounded-full">
                  <span className="text-sm font-medium dark:text-black">{t("accountInformation")}</span>
                </Skeleton>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Type */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon={accountTypeInfo.icon} className={`h-4 w-4 text-primary dark:text-secondary`} />
                  <span className="text-xs text-default-600">{t("accountType")}</span>
                </div>
                <Skeleton isLoaded={!isLoading} className="rounded-full">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold capitalize">{accountTypeInfo.name}</span>
                  </div>
                </Skeleton>
              </div>
              
              {/* Email */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="solar:letter-linear" className="h-4 w-4 text-primary dark:text-secondary" />
                  <span className="text-xs text-default-600">{t("email")}</span>
                </div>
                <Skeleton isLoaded={!isLoading} className="rounded-full">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold font-mono">
                      {session.user.email}
                    </span>
                  </div>
                </Skeleton>
              </div>

              {/* Created Date */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="solar:calendar-date-linear" className="h-4 w-4 text-primary dark:text-secondary" />
                  <span className="text-xs text-default-600">{t("memberSince")}</span>
                </div>
                <Skeleton isLoaded={!isLoading} className="rounded-full">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {getFormattedDate()}
                    </span>
                  </div>
                </Skeleton>
              </div>
              
              {/* Authentication Status */}
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="solar:shield-check-linear" className="h-4 w-4 text-primary dark:text-secondary" />
                  <span className="text-xs text-default-600">{t("accountStatus")}</span>
                </div>
                <Skeleton isLoaded={!isLoading} className="rounded-full">
                  <div className="flex items-center gap-2">
                    <Icon 
                      icon={session.user.emailVerified ? "solar:check-circle-bold" : "solar:close-circle-bold"} 
                      className={session.user.emailVerified ? "text-success h-5 w-5" : "text-danger h-5 w-5"} 
                    />
                    <span className="text-lg font-semibold">
                      {session.user.emailVerified ? t("verified") : t("unverified")}
                    </span>
                  </div>
                </Skeleton>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Business Information Card (only shown if business data exists) */}
      {(business) && (
        <Card shadow="none" className={`w-full overflow-hidden transition-all duration-300 ${className}`} >
          <CardBody className="p-0 w-full">
            <div className="p-4 bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/30 dark:to-warning-800/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-warning/10">
                    <Icon icon="solar:buildings-3-linear" className="h-5 w-5 text-warning" />
                  </div>
                  <Skeleton isLoaded={!isLoading} className="rounded-full">
                    <span className="text-sm font-medium">{t("businessInformation")}</span>
                  </Skeleton>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:shop-2-linear" className="h-4 w-4 text-warning-600" />
                    <span className="text-xs text-default-600">{t("businessName")}</span>
                  </div>
                  <Skeleton isLoaded={!isLoading} className="rounded-full">
                    <span className="text-lg font-semibold">
                      {business?.name || t("notAvailable")}
                    </span>
                  </Skeleton>
                </div>
                
                {/* KVK Number */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:document-text-linear" className="h-4 w-4 text-warning-600" />
                    <span className="text-xs text-default-600">{t("kvkNumber")}</span>
                  </div>
                  <Skeleton isLoaded={!isLoading} className="rounded-full">
                    <span className="text-lg font-semibold font-mono">
                      {business?.kvk || t("notAvailable")}
                    </span>
                  </Skeleton>
                </div>

                {/* VAT Number */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:dollar-minimalistic-linear" className="h-4 w-4 text-warning-600" />
                    <span className="text-xs text-default-600">{t("vatNumber")}</span>
                  </div>
                  <Skeleton isLoaded={!isLoading} className="rounded-full">
                    <span className="text-lg font-semibold font-mono">
                      {business?.vat || t("notAvailable")}
                    </span>
                  </Skeleton>
                </div>
                
                {/* Region */}
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:point-on-map-linear" className="h-4 w-4 text-warning-600" />
                    <span className="text-xs text-default-600">{t("region")}</span>
                  </div>
                  <Skeleton isLoaded={!isLoading} className="rounded-full">
                    <div className="flex items-center gap-2">
                        <Icon icon={flagIcon} width={24} />
                        <span className="text-lg font-semibold">
                        {business?.region || t("notAvailable")}
                        </span> 
                    </div>
                  </Skeleton>
                </div>

                {/* KOR Status
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100 sm:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon="solar:home-angle-2-linear" className="h-4 w-4 text-primary" />
                    <span className="text-xs text-default-600">{t("korStatus")}</span>
                  </div>
                  <Skeleton isLoaded={!isLoading} className="rounded-full">
                    <div className="flex items-center gap-2">
                      <Icon 
                        icon={business?.kor ? "solar:check-circle-bold" : "solar:close-circle-bold"} 
                        className={business?.kor ? "text-success h-5 w-5" : "text-danger h-5 w-5"} 
                      />
                      <span className="text-lg font-semibold">
                        {business?.kor ? t("korEnabled") : t("korDisabled")}
                      </span>
                    </div>
                  </Skeleton>
                </div> */}
              </div>

              {/* Business Address */}
              {business?.location && (
                <div className="mt-4">
                  <div className="p-3 rounded-lg bg-default-50 dark:bg-default-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon icon="solar:map-point-linear" className="h-4 w-4 text-warning-600" />
                      <span className="text-xs text-default-600">{t("registeredAddress")}</span>
                    </div>
                    <Skeleton isLoaded={!isLoading} className="rounded-full w-full">
                      <p className="text-lg font-semibold">
                        {business.location.route}
                      </p>
                      <p className="text-default-500">
                        {business.location.zip_code}, {business.location.city}, {business.location.country}
                      </p>
                    </Skeleton>
                  </div>
                </div>
              )}
              {/* Business Address */}
              {business?.bank_account && (
                <div className="mt-4">
                  <div className="p-3 rounded-lg bg-default-50 dark:bg-default-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon icon="mdi:bank-outline" className="h-4 w-4 text-warning-600" />
                      <span className="text-xs text-default-600">{t("bankAccount")}</span>
                    </div>
                    <Skeleton isLoaded={!isLoading} className="rounded-full w-full">
                      <p className="text-lg font-semibold">
                        {business.bank_account}
                      </p>
                    </Skeleton>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
      
      {/* System Information Section */}
      
      {/*<Card shadow="none" className={`w-full overflow-hidden transition-all duration-300 ${className}`} shadow="sm">*/}
      {/*  <CardBody className="p-0 w-full">*/}
      {/*    <div className="p-4 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/30 dark:to-success-800/20">*/}
      {/*      <div className="flex items-center justify-between">*/}
      {/*        <div className="flex items-center gap-2">*/}
      {/*          <div className="p-2 rounded-full bg-success/10">*/}
      {/*            <Icon icon="solar:widget-linear" className="h-5 w-5 text-success" />*/}
      {/*          </div>*/}
      {/*          <Skeleton isLoaded={!isLoading} className="rounded-full">*/}
      {/*            <span className="text-sm font-medium">{t("systemInformation")}</span>*/}
      {/*          </Skeleton>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}

      {/*    <div className="p-4">*/}
      {/*      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">*/}
      {/*        /!* Browser Information *!/*/}
      {/*        <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">*/}
      {/*          <div className="flex items-center gap-2 mb-1">*/}
      {/*            <Icon icon="solar:browser-linear" className="h-4 w-4 text-primary" />*/}
      {/*            <span className="text-xs text-default-600">{t("browser")}</span>*/}
      {/*          </div>*/}
      {/*          <Skeleton isLoaded={!isLoading} className="rounded-full">*/}
      {/*            <div className="flex items-center gap-2">*/}
      {/*              <span className="text-lg font-semibold">*/}
      {/*                {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').slice(-1)[0] : 'Unknown'}*/}
      {/*              </span>*/}
      {/*            </div>*/}
      {/*          </Skeleton>*/}
      {/*        </div>*/}
      {/*        */}
      {/*        /!* Login Time *!/*/}
      {/*        <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">*/}
      {/*          <div className="flex items-center gap-2 mb-1">*/}
      {/*            <Icon icon="solar:clock-circle-linear" className="h-4 w-4 text-warning" />*/}
      {/*            <span className="text-xs text-default-600">{t("sessionTime")}</span>*/}
      {/*          </div>*/}
      {/*          <Skeleton isLoaded={!isLoading} className="rounded-full">*/}
      {/*            <div className="flex items-center gap-2">*/}
      {/*              <span className="text-lg font-semibold">*/}
      {/*                {new Date().toLocaleTimeString()}*/}
      {/*              </span>*/}
      {/*            </div>*/}
      {/*          </Skeleton>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </CardBody>*/}
      {/*</Card>*/}
    </div>
  );
};

export default BusinessInfo; 