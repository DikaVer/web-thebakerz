/**
 * @fileoverview Icon prop type shared by chat components.
 *
 * Exports IconSvgProps, which extends standard SVG element props with an
 * optional numeric size, for use by SVG icon components.
 */
import type {SVGProps} from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
