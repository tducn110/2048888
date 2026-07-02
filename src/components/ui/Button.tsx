import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  // CTA cam: gradient 180deg, border 2px solid edge, pill, shadow cam
  primary: [
    "text-[#fff8ee]",
    "border-2 border-[var(--orange-cta-edge)]",
    "shadow-[0_4px_0_var(--orange-cta-edge),0_10px_24px_rgba(232,116,50,0.35)]",
    "hover:shadow-[0_2px_0_var(--orange-cta-edge),0_6px_16px_rgba(232,116,50,0.3)]",
    "hover:translate-y-0.5",
    "active:shadow-[0_0px_0_var(--orange-cta-edge)]",
    "active:translate-y-1",
  ].join(" "),

  // Ghost / secondary: cream bg, ink border, sketch feel
  secondary: [
    "bg-[rgba(255,255,255,0.85)] text-[var(--ink-dark)]",
    "border-2 border-[var(--pencil-gray)]",
    "shadow-[0_3px_0_rgba(138,125,101,0.35)]",
    "hover:shadow-[0_1px_0_rgba(138,125,101,0.35)] hover:translate-y-0.5",
    "active:shadow-none active:translate-y-1",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--body-text)]",
    "border border-[rgba(138,125,101,0.4)]",
    "hover:bg-[var(--paper-warm)]",
  ].join(" "),

  danger: [
    "bg-[var(--alert-red)] text-white",
    "border-2 border-[#8b2222]",
    "shadow-[0_3px_0_#8b2222]",
    "hover:shadow-[0_1px_0_#8b2222] hover:translate-y-0.5",
  ].join(" "),
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-full",
  md: "px-6 py-3 text-base rounded-full",
  lg: "px-8 py-4 text-lg rounded-full",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", style, children, ...rest }, ref) => {
    const isPrimary = variant === "primary";

    return (
      <button
        ref={ref}
        style={
          isPrimary
            ? {
                background: "linear-gradient(180deg, #f08a48 0%, #e87432 100%)",
                ...style,
              }
            : style
        }
        className={[
          "inline-flex min-w-0 items-center justify-center gap-2 whitespace-normal break-words text-center font-bold leading-tight",
          "transition-all duration-100 cursor-pointer select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
