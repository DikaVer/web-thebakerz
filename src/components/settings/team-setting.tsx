"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Select,
  SelectItem,
  Spacer,
} from "@heroui/react";
import {Icon} from "@iconify/react";
import {cn} from "@heroui/react";

import OrderManageTable from "./order-manage-table";

interface TeamSettingCardProps {
  className?: string;
}

const roleOptions = [
  {label: "Member", value: "member", description: "team member"},
  {label: "Admin", value: "admin", description: "team admin"},
  {label: "Owner", value: "owner", description: "team owner"},
];

const TeamSetting = React.forwardRef<HTMLDivElement, TeamSettingCardProps>(
  ({className, ...rest}, ref) => (
    <div {...rest} ref={ref} className={cn("p-2", className)}>
      {/* Title */}
      <p className="text-base font-medium text-default-700">Products</p>
      <p className="mt-1 text-sm font-normal text-default-400">Manage and add your products.</p>
      <Spacer y={2} />
      {/* Team management table */}
      <OrderManageTable />

        <Spacer y={6} />
        {/* Team management table */}
        <OrderManageTable />
    </div>
  ),
);

TeamSetting.displayName = "TeamSetting";

export default TeamSetting;
