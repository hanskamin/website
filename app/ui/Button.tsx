import clsx from "clsx";
import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type Variant = "ghost" | "text" | "filled";

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

type ButtonElProps = CommonProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ButtonProps = LinkProps | ButtonElProps;

const base =
  "inline-flex items-center justify-center text-body transition-colors duration-200 min-h-[44px]";

const variants: Record<Variant, string> = {
  ghost:
    "rounded-pill border-hairline-top text-frost px-btn-x py-btn-y hover:bg-white/5",
  text:
    "text-whisper hover:text-frost underline-offset-4 hover:underline px-1",
  filled:
    "rounded-pill border border-frost text-frost px-btn-x py-btn-y bg-[rgba(55,55,55,0.78)] backdrop-blur hover:bg-[rgba(80,80,80,0.85)]",
};

function classes(variant: Variant, fullWidth: boolean | undefined, className: string | undefined) {
  return clsx(
    base,
    variants[variant],
    fullWidth && "w-full sm:w-auto",
    className,
  );
}

export default function Button(props: ButtonProps) {
  if ("href" in props && props.href !== undefined) {
    const { href, external, variant = "ghost", className, children, fullWidth, ...rest } = props;
    const cls = classes(variant, fullWidth, className);
    if (external || /^https?:\/\//.test(href)) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" className={cls} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant = "ghost", className, children, fullWidth, ...rest } = props;
  const cls = classes(variant, fullWidth, className);
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
