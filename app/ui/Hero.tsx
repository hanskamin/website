import clsx from "clsx";
import type { ReactNode } from "react";
import Container from "./Container";

type HeroProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  align?: "left" | "center";
};

export default function Hero({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  titleClassName,
  align = "left",
}: HeroProps) {
  return (
    <section
      className={clsx(
        "min-h-[60vh] flex items-center py-16 md:py-24",
        className,
      )}
    >
      <Container
        className={clsx(
          "flex flex-col gap-elem",
          align === "center" && "items-center text-center",
        )}
      >
        {eyebrow ? (
          <div className="text-caption uppercase tracking-[0.2em] text-whisper flex items-center gap-elem">
            {eyebrow}
          </div>
        ) : null}
        <h1
          className={clsx(
            "font-display text-frost break-words text-h md:text-h-lg leading-[1.05]",
            titleClassName,
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sub text-whisper max-w-[60ch]">{subtitle}</p>
        ) : null}
        {children ? <div className="pt-elem">{children}</div> : null}
      </Container>
    </section>
  );
}
