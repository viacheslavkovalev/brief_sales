import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "darkLink" | "darkCta";
  }
>;

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  const variantClass =
    variant === "darkCta"
      ? "min-h-[52px] rounded-lg bg-figmaBg px-6 py-4 text-white underline underline-offset-4 hover:bg-bg focus:ring-2 focus:ring-figmaBg/40 focus:ring-offset-2 focus:ring-offset-white"
      : variant === "darkLink"
        ? "min-h-0 rounded-none bg-transparent px-0 py-0 text-figmaBg underline underline-offset-4 hover:bg-transparent hover:text-bg focus:ring-2 focus:ring-figmaBg/40 focus:ring-offset-2 focus:ring-offset-white"
        : "min-h-[52px] rounded-lg bg-white px-8 py-4 text-bg hover:bg-[#E8EAED] focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-figmaBg";

  return (
    <button
      className={`font-travelsNext text-base font-bold transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
