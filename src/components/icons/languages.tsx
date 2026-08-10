import type { ComponentType, SVGProps } from "react";
import {
  siC,
  siCplusplus,
  siJavascript,
  siPython,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";
import type { siteConfig } from "@/config/site.config";

type IconProps = SVGProps<SVGSVGElement>;
type Language = (typeof siteConfig.languages)[number];

function BrandIcon({
  icon,
  className,
  ...props
}: IconProps & { icon: SimpleIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d={icon.path} />
    </svg>
  );
}

/** Java non è in simple-icons (marchio); silhouette classica del logo. */
function JavaIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M8.851 18.56s-.917.533.653.713c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.148M8.074 15s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218m14.34 7.005s.672.554-.74.982c-2.688.811-11.192 1.059-13.555.032-.849-.37.743-.885 1.243-.994.521-.114.819-.093.819-.093-.942-.664-6.092 1.304-2.615 2.348 9.479 2.844 17.287-.809 14.848-2.275M9.037 11.789s-4.321 1.025-1.531 1.397c1.176.156 3.518.121 5.703-.062 1.786-.149 3.578-.468 3.578-.468s-.629.269-1.083.579c-4.381 1.152-12.845.615-10.402-.563 2.066-.997 3.735-.883 3.735-.883m7.955 5.586c4.449-2.311 2.392-4.533.957-4.223-.351.076-.508.142-.508.142s.131-.205.381-.293c2.845-.999 7.975 2.887-1.455 4.418 0 0 .109-.098.625-.044M18.174 2.921S19.315 4.24 17.178 6.246c-1.715 1.615-1.96 2.399-1.96 2.399s4.751-2.443 2.956-5.724c0 0-2.322-1.294-4.788.251C9.363 6.62 8.11 8.57 8.11 8.57S11.34 4.34 15.52 3.726c.314-.046.654-.11.654-.11M13.598.004S11.34 1.915 11.218 4.598c0 0 .906-1.567 2.702-2.281 1.397-.555 2.148-.72 2.148-.72s-.563-.934-2.47-1.593" />
    </svg>
  );
}

function makeIcon(icon: SimpleIcon) {
  return function LanguageBrandIcon(props: IconProps) {
    return <BrandIcon icon={icon} {...props} />;
  };
}

export const languageIcons: Record<
  Language,
  { Icon: ComponentType<IconProps>; color: string }
> = {
  C: { Icon: makeIcon(siC), color: `#${siC.hex}` },
  "C++": { Icon: makeIcon(siCplusplus), color: `#${siCplusplus.hex}` },
  Java: { Icon: JavaIcon, color: "#ED8B00" },
  JavaScript: {
    Icon: makeIcon(siJavascript),
    color: `#${siJavascript.hex}`,
  },
  Python: { Icon: makeIcon(siPython), color: `#${siPython.hex}` },
  TypeScript: {
    Icon: makeIcon(siTypescript),
    color: `#${siTypescript.hex}`,
  },
};
