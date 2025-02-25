import React, { ReactNode, useMemo } from 'react';
import { Alert, AlertProps, cn } from '@heroui/react';

export interface CustomAlertProps extends Omit<AlertProps, 'color' | 'variant' | 'title'> {
    title?: string;
    children: ReactNode;
    variant?: "faded" | "solid" | "flat" | "bordered" | undefined;
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    hideIcon?: boolean;
    className?: string;
    classNames?: {
        base?: string;
        mainWrapper?: string;
        iconWrapper?: string;
        [key: string]: any;
    };
}

const CustomAlert = React.forwardRef<HTMLDivElement, CustomAlertProps>(
    (
        { title, children, variant = 'faded', color = 'secondary', hideIcon = false, className, classNames = {}, ...props },
        ref
    ) => {
        const computedColorClass = useMemo(() => {
            switch (color) {
                case 'default':
                    return 'before:bg-default-300';
                case 'primary':
                    return 'before:bg-primary';
                case 'secondary':
                    return 'before:bg-secondary';
                case 'success':
                    return 'before:bg-success';
                case 'warning':
                    return 'before:bg-warning';
                case 'danger':
                    return 'before:bg-danger';
                default:
                    return 'before:bg-default-200';
            }
        }, [color]);

        return (
            <Alert
                ref={ref}
                hideIcon={hideIcon}
                classNames={{
                    ...classNames,
                    base: cn(
                        'flex flex-row-reverse bg-background',
                        'border-0 border-default-200 dark:border-default-100',
                        "relative before:content-[''] before:absolute before:z-10",
                        'before:left-0 before:top-[-1px] before:bottom-[-1px] before:w-1',
                        'rounded-l-none border-l-0',
                        computedColorClass,
                        classNames.base,
                        className
                    ),
                    mainWrapper: cn('pt-1', classNames.mainWrapper),
                    iconWrapper: cn(`dark:bg-transparent text-${color}-400`, classNames.iconWrapper),
                    title: cn(`text-${color}-400 font-medium`, classNames.title),
                }}
                color={color}
                title={title}
                variant={variant}
                {...props}
            >
                {children}
            </Alert>
        );
    }
);

CustomAlert.displayName = 'CustomAlert';

export default CustomAlert;
