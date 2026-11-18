import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-pixel uppercase leading-none cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "pixel-btn bg-primary text-primary-foreground",
        secondary: "pixel-btn bg-secondary text-secondary-foreground",
        gold: "pixel-btn bg-gold text-gold-foreground",
        outline: "pixel-btn bg-panel-inset text-foreground",
        destructive: "pixel-btn bg-destructive text-destructive-foreground",
        ghost: "text-foreground hover:bg-accent",
        link: "text-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 text-[10px] [&_svg]:size-4",
        sm: "h-9 px-3 text-[9px] [&_svg]:size-3.5",
        lg: "h-14 px-6 text-xs [&_svg]:size-5",
        icon: "h-10 w-10 text-[10px] [&_svg]:size-4",
        "icon-sm": "h-8 w-8 text-[9px] [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
