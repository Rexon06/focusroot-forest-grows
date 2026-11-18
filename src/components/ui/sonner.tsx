import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const pixelToastVars = {
  "--normal-bg": "var(--panel)",
  "--normal-text": "var(--foreground)",
  "--normal-border": "var(--outline)",
  "--success-bg": "var(--panel)",
  "--success-text": "var(--foreground)",
  "--success-border": "var(--outline)",
  "--error-bg": "var(--panel)",
  "--error-text": "var(--foreground)",
  "--error-border": "var(--destructive)",
  "--border-radius": "0px",
} as CSSProperties;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={pixelToastVars}
      toastOptions={{
        classNames: {
          toast: "!border-[3px] !shadow-[4px_4px_0_0_var(--outline)] font-body !text-base",
          title: "font-pixel !text-[10px] leading-relaxed",
          description: "!text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
