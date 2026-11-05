"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  labels: Record<string, React.ReactNode>;
  registerLabel: (val: string, label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error("Select components must be used within a <Select> parent.");
  }
  return ctx;
}

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function Select({
  children,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({});
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const registerLabel = React.useCallback((val: string, label: React.ReactNode) => {
    setLabels((prev) => {
      if (prev[val] === label) return prev;
      return { ...prev, [val]: label };
    });
  }, []);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        triggerRef,
        labels,
        registerLabel,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useSelectContext();

    const composedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref, triggerRef]
    );

    return (
      <button
        ref={composedRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="select-content"
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        )}
        onClick={(e) => {
          setOpen(!open);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "ms-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
            open && "rotate-180"
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
  children?: React.ReactNode;
}

function SelectValue({ placeholder, className, children, ...props }: SelectValueProps) {
  const { value, labels } = useSelectContext();
  const label = labels[value];
  const display = children !== undefined ? children : label !== undefined ? label : value || placeholder;

  return (
    <span className={cn("pointer-events-none truncate", className)} {...props}>
      {display}
    </span>
  );
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useSelectContext();
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          contentRef.current &&
          !contentRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, setOpen, triggerRef]);

    return (
      <div
        ref={(node) => {
          (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        className={cn(
          "absolute z-50 mt-1 max-h-60 w-full min-w-[8rem] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
          !open && "hidden",
          className
        )}
        role="listbox"
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value: itemValue, disabled, onClick, ...props }, ref) => {
    const { value, onValueChange, setOpen, registerLabel } = useSelectContext();
    const isSelected = value === itemValue;

    React.useEffect(() => {
      if (itemValue !== undefined && children !== undefined) {
        registerLabel(itemValue, children);
      }
    }, [itemValue, children, registerLabel]);

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        data-disabled={disabled || undefined}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pe-8 ps-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={(e) => {
          if (disabled) return;
          onValueChange(itemValue);
          setOpen(false);
          onClick?.(e);
        }}
        {...props}
      >
        {isSelected && (
          <span className="absolute end-2 flex h-4 w-4 items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        )}
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
