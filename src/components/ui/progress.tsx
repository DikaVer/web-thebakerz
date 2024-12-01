import {forwardRef} from "@nextui-org/system";
import {useProgress} from "@nextui-org/progress";
import {ProgressSlots, ProgressVariantProps, SlotsToClasses} from "@nextui-org/theme";
import {HTMLNextUIProps} from "@nextui-org/react";
import {ReactRef} from "@nextui-org/react-utils";
//@ts-ignore
import type {AriaProgressBarProps} from "@react-types/progress";

interface Props extends HTMLNextUIProps<"div"> {
  /**
   * Ref to the DOM node.
   */
  ref?: ReactRef<HTMLElement | null>;
  /**
   * Whether to show the value label.
   * @default false
   */
  showValueLabel?: boolean;
  /**
   * Classname or List of classes to change the classNames of the element.
   * if `className` is passed, it will be added to the base slot.
   *
   * @example
   * ```ts
   * <Progress classNames={{
   *    base:"base-classes",
   *    labelWrapper: "labelWrapper-classes",
   *    label: "label-classes",
   *    value: "value-classes",
   *    track: "track-classes",
   *    indicator: "indicator-classes",
   * }} />
   * ```
   */
  classNames?: SlotsToClasses<ProgressSlots>;
}

export type UseProgressProps = Props & AriaProgressBarProps & ProgressVariantProps;
export interface ProgressProps extends UseProgressProps {
  labelValueString?: string;
  showCustomLabelString: boolean;
}

const Progress = forwardRef<"div", ProgressProps>((props, ref) => {
  const {
    Component,
    slots,
    classNames,
    label,
    percentage,
    showValueLabel,
    getProgressBarProps,
    getLabelProps,
  } = useProgress({...props, ref});

  const progressBarProps = getProgressBarProps();
  const shouldShowLabelWrapper = label || showValueLabel;

  return (
    <Component {...progressBarProps}>
      {shouldShowLabelWrapper ? (
        <div className={slots.labelWrapper({class: classNames?.labelWrapper})}>
          {label && <span {...getLabelProps()}>{label}</span>}
          {showValueLabel && (
            <span className={slots.value({class: classNames?.value})}>
              {progressBarProps["aria-valuetext"]}
            </span>
          )}
          {props.showCustomLabelString && (
              <span className={slots.value({class: classNames?.value})}>
              {props.labelValueString}
            </span>
          )}
        </div>
      ) : null}
      <div className={slots.track({class: classNames?.track})}>
        <div
          className={slots.indicator({class: classNames?.indicator})}
          style={{
            transform: `translateX(-${100 - (percentage || 0)}%)`,
          }}
        />
      </div>
    </Component>
  );
});

Progress.displayName = "NextUI.Progress";

export default Progress;
