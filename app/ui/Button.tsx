"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";

type ButtonProps = {
  className?: string,
  title?: string,
  route?: string,
};

export default function Button({ className, title, route }: ButtonProps) {
  const router = useRouter();

  const goToRoute = () => {
    if (route) {
      router.replace(route);
    }
  };

  return (
    <button
      className={clsx(
        "w-[200px] bg-[#000000] rounded-full py-3 text-center font-[family-name:var(--font-geist-mono)]",
        className,
      )}
      onClick={goToRoute}
    >
      {title}
    </button>
  );
}