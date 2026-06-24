import type { PropsWithChildren } from "react";
import { Logo } from "./Logo";

type ScreenShellProps = PropsWithChildren<{
  className?: string;
}>;

export function ScreenShell({ children, className = "" }: ScreenShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-figmaBg px-6 py-6 text-white md:px-10 md:py-8">
      <div className={`relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[760px] flex-col md:min-h-[912px] ${className}`}>
        <Logo />
        {children}
      </div>
    </main>
  );
}
