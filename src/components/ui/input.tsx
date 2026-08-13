import type { InputHTMLAttributes } from "react"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
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
    <label htmlFor={id} className="text-sm font-medium text-foreground">
      {label}
    </label>
    <input
      id={id}
      aria-invalid={Boolean(error)}
      className={`h-11 rounded-xl border bg-card px-3 text-sm outline-none ring-primary focus:ring-2 ${error ? "border-danger" : "border-border"} ${className}`}
      {...props}
    />
    {Boolean(error) && (
      <p className="text-sm text-danger" role="alert">
        {error}
      </p>
    )}
  </div>
)
