/**
 * @fileoverview Project button primitive wrapping the Hero UI Button.
 *
 * Exports Button and buttonVariants. Unlike the stock Shadcn/ui button (which
 * uses Radix), this version forwards props to the Hero UI Button while applying
 * class-variance-authority styling, including project-specific variants such as
 * free, busy, closed, and disabled for store availability states.
 */
import React, { forwardRef } from "react";
import { Button as Btn } from "@heroui/react";
import { cva } from "class-variance-authority";

const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
        "border border-input bg-outline hover:bg-outline-foreground ",
    secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
    ghost: "bg-transparent border-0",
    link: "text-primary underline-offset-4 hover:underline",
    free: "bg-greenBakerz text-white rounded-full hover:scale-100 scale-95",
    busy: "bg-orangeBakerz text-white rounded-full hover:scale-100 scale-95",
    closed: "bg-redBakerz text-white rounded-full hover:scale-100 scale-95",
    disabled: "bg-gray-400 text-white rounded-full cursor-not-allowed",
}

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: variants,
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

type CustomButtonProps = {
    variant?: keyof typeof variants;
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
} & React.ComponentProps<typeof Btn>;

const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(
    ({ variant, size, className, ...props }, ref) => (
        <Btn
            ref={ref}
            className={`${buttonVariants({ variant, size })} ${className}`}
            {...props}
        />
    )
);

Button.displayName = "Button";

export { buttonVariants, Button };