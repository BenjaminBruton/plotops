import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "px-3 py-2",
        ghost: "border-0 bg-transparent px-3 py-2 focus-visible:ring-1 focus-visible:ring-offset-0",
        filled: "bg-muted border-0 px-3 py-2 focus-visible:bg-background",
      },
      size: {
        default: "h-10",
        sm: "h-9 px-2 text-xs",
        lg: "h-11 px-4",
        xl: "h-12 px-4 text-base",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-status-success focus-visible:ring-status-success",
        warning: "border-status-warning focus-visible:ring-status-warning",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, state, leftIcon, rightIcon, error, helperText, type, ...props }, ref) => {
    const hasError = error || state === "error"
    const inputState = hasError ? "error" : state

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant, size, state: inputState, className }),
              leftIcon && "pl-10",
              rightIcon && "pr-10"
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={cn(
            "mt-1 text-xs",
            hasError ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Textarea component
const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-status-success focus-visible:ring-status-success",
        warning: "border-status-warning focus-visible:ring-status-warning",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, error, helperText, ...props }, ref) => {
    const hasError = error || state === "error"
    const textareaState = hasError ? "error" : state

    return (
      <div className="w-full">
        <textarea
          className={cn(textareaVariants({ state: textareaState, className }))}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            "mt-1 text-xs",
            hasError ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

// Search Input component
export interface SearchInputProps extends Omit<InputProps, "leftIcon" | "type"> {
  onSearch?: (value: string) => void
  onClear?: () => void
  showClearButton?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, showClearButton = true, value, onChange, ...props }, ref) => {
    const [searchValue, setSearchValue] = React.useState(value || "")

    React.useEffect(() => {
      setSearchValue(value || "")
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setSearchValue(newValue)
      onChange?.(e)
      
      // Debounced search
      const timeoutId = setTimeout(() => {
        onSearch?.(newValue)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    }

    const handleClear = () => {
      setSearchValue("")
      onClear?.()
      const event = { target: { value: "" } } as React.ChangeEvent<HTMLInputElement>
      onChange?.(event)
    }

    return (
      <Input
        ref={ref}
        type="search"
        value={searchValue}
        onChange={handleChange}
        leftIcon={
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        rightIcon={
          showClearButton && searchValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null
        }
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

export { Input, Textarea, SearchInput, inputVariants, textareaVariants }