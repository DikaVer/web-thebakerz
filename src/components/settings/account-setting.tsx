"use client";

import * as React from "react";
import {Button, Input, Select, SelectItem, Spacer} from "@heroui/react";
import {cn} from "@heroui/react";

interface AccountSettingCardProps {
  className?: string;
}

const timeZoneOptions = [
  {
    label: "Coordinated Universal Time (UTC-3)",
    value: "utc-3",
    description: "Coordinated Universal Time (UTC-3)",
  },
  {
    label: "Coordinated Universal Time (UTC-4)",
    value: "utc-4",
    description: "Coordinated Universal Time (UTC-4)",
  },
  {
    label: "Coordinated Universal Time (UTC-5)",
    value: "utc-5",
    description: "Coordinated Universal Time (UTC-5)",
  },
];

{/*  Settings Content */}
{/*<div className="w-full max-w-2xl flex-1 p-4">*/}
{/*    /!* Title *!/*/}
{/*    <div className="flex items-center gap-x-3">*/}
{/*        <Button*/}
{/*            isIconOnly*/}
{/*            className="sm:hidden"*/}
{/*            size="sm"*/}
{/*            variant="flat"*/}
{/*            onPress={() => {*/}
{/*                setIsCollapsed(false);*/}
{/*                onOpenChange();*/}
{/*            }}*/}
{/*        >*/}
{/*            <Icon*/}
{/*                className="text-default-500"*/}
{/*                icon="solar:sidebar-minimalistic-linear"*/}
{/*                width={20}*/}
{/*            />*/}
{/*        </Button>*/}
{/*        <h1 className="text-3xl font-bold leading-9 text-default-foreground">Settings</h1>*/}
{/*    </div>*/}
{/*    <h2 className="mt-2 text-small text-default-500">*/}
{/*        Customize settings, email preferences, and web appearance.*/}
{/*    </h2>*/}
{/*    /!*  Tabs *!/*/}
{/*    <Tabs*/}
{/*        fullWidth*/}
{/*        classNames={{*/}
{/*            base: "mt-6",*/}
{/*            cursor: "bg-content1 dark:bg-content1",*/}
{/*            panel: "w-full p-0 pt-4",*/}
{/*        }}*/}
{/*    >*/}
{/*        <Tab key="profile" title="Profile">*/}
{/*            <ProfileSetting />*/}
{/*        </Tab>*/}
{/*        <Tab key="appearance" title="Appearance">*/}
{/*            <AppearanceSetting />*/}
{/*        </Tab>*/}
{/*        <Tab key="account" title="Account">*/}
{/*            <AccountSetting />*/}
{/*        </Tab>*/}
{/*        <Tab key="billing" title="Billing">*/}
{/*            <BillingSetting />*/}
{/*        </Tab>*/}
{/*        <Tab key="team" title="Team">*/}
{/*            <TeamSetting />*/}
{/*        </Tab>*/}
{/*    </Tabs>*/}
{/*</div>*/}

const AccountSetting = React.forwardRef<HTMLDivElement, AccountSettingCardProps>(
  ({className, ...props}, ref) => (
    <div ref={ref} className={cn("p-2", className)} {...props}>
      {/* Full name */}
      <div>
        <p className="text-base font-medium text-default-700">Full name</p>
        <p className="mt-1 text-sm font-normal text-default-400">Name to be used for emails.</p>
        <Input className="mt-2" placeholder="e.g Kate Moore" />
      </div>
      <Spacer y={2} />
      {/* Username */}
      <div>
        <p className="text-base font-medium text-default-700">Username</p>
        <p className="mt-1 text-sm font-normal text-default-400">Nickname or first name.</p>
        <Input className="mt-2" placeholder="kate.moore" />
      </div>
      <Spacer y={2} />
      {/* Email Address */}
      <div>
        <p className="text-base font-medium text-default-700">Email Address</p>
        <p className="mt-1 text-sm font-normal text-default-400">
          The email address associated with your account.
        </p>
        <Input className="mt-2" placeholder="e.g kate.moore@acme.com" />
      </div>
      <Spacer y={2} />
      {/* Timezone */}
      <section>
        <div>
          <p className="text-base font-medium text-default-700">Timezone</p>
          <p className="mt-1 text-sm font-normal text-default-400">Set your current timezone.</p>
        </div>
        <Select className="mt-2" defaultSelectedKeys={["utc-3"]}>
          {timeZoneOptions.map((timeZoneOption) => (
            <SelectItem key={timeZoneOption.value} value={timeZoneOption.value}>
              {timeZoneOption.label}
            </SelectItem>
          ))}
        </Select>
      </section>
      <Spacer y={2} />
      <Button className="mt-4 bg-default-foreground text-background" size="sm">
        Update Account
      </Button>
    </div>
  ),
);

AccountSetting.displayName = "AccountSetting";

export default AccountSetting;
