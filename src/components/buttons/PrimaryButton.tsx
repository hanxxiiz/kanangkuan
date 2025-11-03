"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "flat" | "outline";
    size?: "sm" | "md" | "lg";
}

export const Button = ({
    children,
    variant = "flat",
    size = "lg",
    className = "",
    ...props
}: ButtonProps) => {
    let variantClasses = "";
    if (variant === "flat") variantClasses = "bg-black text-white hover:bg-pink";
    else if (variant === "outline") variantClasses = "border border-black text-black hover:bg-black hover:text-white";

    let sizeClasses = "";
    if (size === "sm") sizeClasses = "px-3 py-1 text-xs";
    else if (size === "md") sizeClasses = "px-4 py-1 text-sm";
    else if (size === "lg") sizeClasses = "px-10 py-1 text-base";

    return (
    <button
      className={`rounded-full font-main transition-colors focus:outline-none cursor-pointer ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};