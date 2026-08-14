import type { InputHTMLAttributes, ReactNode } from "react"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode
  error?: string
}

export const Input = ({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
    >
      {label}
    </label>
    <input
      id={id}
      aria-invalid={Boolean(error)}
      className={`h-11 rounded-xl border bg-card px-3 text-sm outline-none ring-accent focus:ring-2 ${error ? "border-danger" : "border-border"} ${className}`}
      {...props}
    />
    {Boolean(error) && (
      <p className="text-sm text-danger" role="alert">
        {error}
      </p>
    )}
  </div>
)
