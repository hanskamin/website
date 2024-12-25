import clsx from "clsx";

type ButtonProps = {
  className?: string,
  title?: string,
};

export default function Button({ className, title }: ButtonProps) {
  return (
    <div className={clsx(className)}>
      <button>
        {title}
      </button>
    </div>
  );
}