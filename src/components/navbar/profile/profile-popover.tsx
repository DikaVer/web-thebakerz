'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger, Button, cn, Badge } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useHoverPopover } from '@/hooks/use-hover-popover';
import { SessionValidationResult } from '@/lib/actions/session';
import { useMediaQuery } from 'usehooks-ts';
import { useTranslations } from 'next-intl';
import { useStore } from '@/components/providers/store-provider';
import { logoutAction } from '@/app/actions';
import { useSession } from '@/components/providers/session-provider';

interface ProfilePopoverProps {
  session: SessionValidationResult;
  trigger: React.ReactNode;
}

export const ProfilePopover = ({ session, trigger }: ProfilePopoverProps) => {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const { isHovered, setIsHovered, triggerRef, popoverRef } = useHoverPopover();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const t = useTranslations('app/(return_page)/profile');
  const { store } = useStore();

  const { setSession } = useSession();
  const pathname = usePathname();

  // Check if user has bakerz role
  const isBakerz = !!session?.user?.role && session.user.role === "bakerz";
  // Get user's stores
  const stores = session?.stores || [];

  const handleSignOut = () => {
    startTransition(async () => {
        sessionStorage.clear();
        localStorage.clear();
        setSession((prevSession) => {
            return {
                ...prevSession,
                session: null,
                user: null,
                stores: null,
            };
        });
        await logoutAction();
        router.refresh();
        router.push(`/transit-exit?next=${pathname}`);
    });
  };  
  
  // Create ref for the entire component
  const componentRef = useRef<HTMLDivElement>(null);


  const menuItems = [
    { label: 'Find desserts', icon: 'iconoir:search', action: () => router.push('/search') },
    { label: 'Contact us', icon: 'solar:user-rounded-linear', action: () => router.push('/support/contact-us') },
    ...(!isBakerz ? [{ label: 'Create Store', icon: 'solar:shop-2-linear', action: () => router.push('/become-partner') }] : []),
    { label: 'FAQ', icon: 'solar:question-circle-linear', action: () => router.push('/support') },
    // { label: 'Affiliate network', icon: 'solar:link-circle-linear', action: () => router.push('/affiliate') },
    { label: 'User agreement', icon: 'solar:document-linear', action: () => router.push('/policies/terms-of-use') },
    ...(session.user ? [{ label: 'Logout', color: 'danger', icon: 'solar:logout-linear', action: handleSignOut }] : []),
  ];

  return (
    <div ref={componentRef}>
      <Popover 
        placement="bottom-end" 
        showArrow 
        offset={10}
        classNames={{
            content: 'p-1 bg-white/40 backdrop-blur-xl',
        }}
      >
        <PopoverTrigger>
          <div 
            ref={triggerRef}
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsManualOpen(prev => !prev);
            }}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={(e) => {
              if (isMobile) return;
              
              const relatedTarget = e.relatedTarget as Node;
              if (popoverRef.current?.contains(relatedTarget)) {
                return;
              }
              if (!isManualOpen) {
                setIsHovered(false);
              }
            }}
          >
            {trigger}
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <div 
            ref={popoverRef}
            className="flex flex-col w-80 gap-1 shadow-xl"
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => {
              if (isMobile) return;
              
              if (!isManualOpen) {
                setIsHovered(false);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >

            {!session.user ? (
                    <>
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-background">
                          <h3 className="text-xl font-semibold">{t("loginTitle")}</h3>
                          <p className="text-sm text-foreground/60">{t("loginDescription")}</p>
                          <Button 
                              className="bg-gradient-primary font-medium rounded-md w-full mt-2 py-6"
                              color="primary"
                              onPress={() => {
                              router.push(`/auth?next=${pathname}`);
                              setIsManualOpen(false);
                              }}
                          >
                              {t("login")}
                          </Button>
                      </div>

                    </>


                ) : (
                    <div className="flex flex-col gap-1 p-3 rounded-xl bg-background"
                        onClick={() => {
                            router.push('/settings');
                            setIsManualOpen(false);
                        }}
                    >
                        <h3 className="text-xl font-semibold">{session.user.username}</h3>
                        <div 
                            className="flex items-center gap-1 cursor-pointer group"
                        >
                            <p className="text-sm text-foreground/60 group-hover:underline">{t("profileSettings")}</p>
                            <Icon icon="solar:alt-arrow-right-linear" className="text-foreground/60" width={16} />
                        </div>
                    </div>
                )}
 
                {isBakerz && stores.length > 0 && (
                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-background">
                        <h3 className="text-base font-semibold flex items-center gap-2">
                            <Icon icon="solar:shop-2-bold" width={20} />
                            Your Stores
                        </h3>
                        <div className="flex flex-col w-full gap-2 max-h-[180px] overflow-y-auto">
                            {stores.map((storeItem) => (
                                <Button
                                    key={storeItem.id}
                                    size="sm"
                                    variant={storeItem.id === store?.id ? "solid" : "light"}
                                    className={cn("justify-between w-full", 
                                        storeItem.id === store?.id && "bg-default-200")}
                                    onPress={() => {
                                        router.push(`/${storeItem.name || storeItem.id}`);
                                        setIsManualOpen(false);
                                    }}
                                >
                                    <span className="truncate">{storeItem.name || storeItem.id}</span>
                                    {storeItem.newOrdersCount > 0 && (
                                        <p className="text-xs text-default-400 text-white rounded-full bg-danger-500 p-1 px-2">{storeItem.newOrdersCount}</p>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {session.user?.role === "admin" && (
                    <div className="flex flex-col p-2 rounded-xl bg-background">
                        <h3 className="text-base font-semibold px-2 py-1 flex items-center gap-2">
                            <Icon icon="solar:widget-2-outline" width={20} />
                            Dashboard
                        </h3>
                        
                        <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-background-secondary rounded-md p-2 py-3"
                            onClick={() => {
                                router.push('/dashboard/overview');
                                setIsManualOpen(false);
                            }}
                        >
                            <Icon icon="solar:bomb-emoji-broken" width={20} height={20} />
                            <span className="text-sm">Orders Overview</span>
                        </div>
                        
                        <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-background-secondary rounded-md p-2 py-3"
                            onClick={() => {
                                router.push('/dashboard/orders');
                                setIsManualOpen(false);
                            }}
                        >
                            <Icon icon="solar:notification-unread-lines-broken" width={20} height={20} />
                            <span className="text-sm">Orders - Delivery</span>
                        </div>
                        
                        <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-background-secondary rounded-md p-2 py-3"
                            onClick={() => {
                                router.push('/dashboard/users');
                                setIsManualOpen(false);
                            }}
                        >
                            <Icon icon="solar:user-hand-up-broken" width={20} height={20} />
                            <span className="text-sm">Users</span>
                        </div>
                        
                        {/* <div 
                            className="flex items-center gap-2 cursor-pointer hover:bg-background-secondary rounded-md p-2 py-3"
                            onClick={() => {
                                router.push('/dashboard/stripe');
                                setIsManualOpen(false);
                            }}
                        >
                            <Icon icon="solar:shop-2-broken" width={20} height={20} />
                            <span className="text-sm">Stripe</span>
                        </div> */}
                    </div>
                )}

                {session.user && (
                    <div className="flex flex-col p-2 rounded-xl bg-background">
                        <div 
                        key={"orders"}
                        className="flex items-center gap-2 cursor-pointer hover:bg-background-secondary rounded-md p-2 py-3"
                        onClick={() => {
                            router.push('/orders');
                            setIsManualOpen(false);
                        }}
                        >
                        <Icon icon="mdi:order-bool-descending" width={20} height={20} />
                        <span className="text-sm">Orders</span>
                        </div>

                        <div 
                        key={"favorites"}
                        className="flex items-center gap-2 cursor-pointer hover:bg-background-secondary rounded-md p-2 py-3"
                        onClick={() => {
                            router.push('/favorites');
                            setIsManualOpen(false);
                        }}
                        >
                        <Icon icon="solar:heart-bold" width={20} height={20} />
                        <span className="text-sm">Favorites</span>
                        </div>

                    </div>
                )}
              
            <div className="flex flex-col p-2 bg-background rounded-xl">
              {menuItems.map((item, index) => (
                item && (
                  <div 
                    key={index}
                    className={cn("flex items-center gap-2 cursor-pointer hover:bg-background-secondary rounded-md p-2 py-3 text-foreground", {
                      "text-danger-500": item.color === 'danger',
                    })}
                    onClick={() => {
                      item.action();
                      setIsManualOpen(false);
                    }}
                  >
                    <Icon icon={item.icon} width={20} height={20} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProfilePopover;
