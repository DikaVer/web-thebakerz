import {Button, Tooltip} from "@heroui/react";
import React, {forwardRef, memo, useMemo} from "react";
import {cn} from "@heroui/react";
import showSuccessMessage from "@/components/toast/toast-succes";

export interface CopyTextProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  textClassName?: string;
  copyText: string;
  textNotify: string;
  isIconOnly?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isDisabled?: boolean;
}

export const CopyText = memo(
  forwardRef<HTMLDivElement, CopyTextProps>((props, forwardedRef) => {
    const {className, textClassName, children, copyText = "Copy"} = props;
    const [copied, setCopied] = React.useState(false);
    const [copyTimeout, setCopyTimeout] = React.useState<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const onClearTimeout = () => {
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
    };

    const handleClick = () => {
      onClearTimeout();
      navigator.clipboard.writeText(copyText);
      setCopied(true);
      props.onClose &&  props.onClose();

      showSuccessMessage({success: props.textNotify});

      setCopyTimeout(
        setTimeout(() => {
          setCopied(false);
        }, 3000),
      );
    };

    const content = useMemo(() => (copied ? "Copied" : "Copy"), [copied, copyText]);

    return (
      <div ref={forwardedRef} className={cn("flex items-center gap-3 ", className)}>
        <Tooltip className="text-foreground" content={content}>
            <Button
                isIconOnly={props.isIconOnly}
                variant="light"
                radius="full"
                isDisabled={props.isDisabled}
                startContent={props.startContent}
                endContent={props.endContent}
                onPress={handleClick}
            >
                {children}
            </Button>
        </Tooltip>
      </div>
    );
  }),
);

CopyText.displayName = "CopyText";
