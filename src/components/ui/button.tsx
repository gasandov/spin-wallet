import type { ButtonHTMLAttributes } from "react"

const variants = {
  primary:
    "bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50",
  secondary:
    "border border-border bg-card text-foreground hover:bg-background disabled:opacity-50",
  ghost: "text-accent hover:opacity-80 disabled:opacity-50",
} as const

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
}

export const Button = ({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-opacity ${variants[variant]} ${className}`}
    {...props}
  />
)
