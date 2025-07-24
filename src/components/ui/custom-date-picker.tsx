import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "../../lib/utils"

interface CustomDatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const CustomDatePicker = React.forwardRef<
  HTMLInputElement,
  CustomDatePickerProps
>(({ value, onChange, placeholder, disabled, className, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    if (dateValue) {
      onChange(new Date(dateValue))
    } else {
      onChange(null)
    }
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ""
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="relative">
      <input
        ref={ref}
        type="date"
        value={formatDateForInput(value)}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  )
})
CustomDatePicker.displayName = "CustomDatePicker"