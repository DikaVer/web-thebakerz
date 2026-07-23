/**
 * @fileoverview Sidebar drawer built on the HeroUI Drawer component.
 *
 * Exports SidebarDrawer, a forwardRef wrapper that slides in from the left or
 * right edge with framer-motion enter/exit variants, supports a configurable
 * sidebar width via a CSS variable, uses a blurred backdrop, and also renders
 * a hidden static copy of its children for non-drawer layouts.
 */
"use client";
import type {ModalProps} from "@heroui/react";

import React from "react";
import {TRANSITION_EASINGS} from "@heroui/framer-utils";
import {cn, Drawer, DrawerBody, DrawerContent} from "@heroui/react";

const SidebarDrawer = React.forwardRef<
  HTMLDivElement,
  ModalProps & {
    sidebarWidth?: number;
    sidebarPlacement?: "left" | "right";
  }
>(
  (
    {
      children,
      className,
      onOpenChange,
      isOpen,
      sidebarWidth = 288,
      classNames = {},
      backdrop = "blur",
      sidebarPlacement = "right",
      motionProps: drawerMotionProps,
      ...props
    },
    ref,
  ) => {
    const motionProps = React.useMemo(() => {
      if (!!drawerMotionProps && typeof drawerMotionProps === "object") {
        return drawerMotionProps;
      }

      return {
        variants: {
          enter: {
            x: 0,
            transition: {
              x: {
                duration: 0.3,
                ease: TRANSITION_EASINGS.easeOut,
              },
            },
          },
          exit: {
            x: sidebarPlacement == "left" ? -sidebarWidth : sidebarWidth,
            transition: {
              x: {
                duration: 0.2,
                ease: TRANSITION_EASINGS.easeOut,
              },
            },
          },
        },
      };
    }, [sidebarWidth, sidebarPlacement, drawerMotionProps]);

    return (
      <>
        <Drawer
          ref={ref}
          {...props}
          classNames={{
            ...classNames,
            wrapper: cn("!w-[var(--sidebar-width)]", classNames?.wrapper, {
              "!items-start !justify-start ": sidebarPlacement === "left",
              "!items-end !justify-end": sidebarPlacement === "right",
            }),
            base: cn(
              "w-[var(--sidebar-width)] !m-0 p-0 h-full max-h-full",
              classNames?.base,
              className,
              {
                "inset-y-0 left-0 max-h-[none] rounded-l-none !justify-start":
                  sidebarPlacement === "left",
                "inset-y-0 right-0 max-h-[none] rounded-r-none !justify-end":
                  sidebarPlacement === "right",
              },
            ),
            body: cn("p-0", classNames?.body),
            closeButton: cn("z-50", classNames?.closeButton),
          }}
          isOpen={isOpen}
          motionProps={motionProps}
          radius="none"
          scrollBehavior="inside"
          style={{
            // @ts-ignore
            "--sidebar-width": `${sidebarWidth}px`,
          }}
          backdrop="blur"
          onOpenChange={onOpenChange}
        >
          <DrawerContent>
            <DrawerBody>{children}</DrawerBody>
          </DrawerContent>
        </Drawer>
        <div
          className={cn(
            "hidden h-full max-w-[var(--sidebar-width)] overflow-x-hidden overflow-y-scroll",
            className,
          )}
        >
          {children}
        </div>
      </>
    );
  },
);

SidebarDrawer.displayName = "SidebarDrawer";

export default SidebarDrawer; 