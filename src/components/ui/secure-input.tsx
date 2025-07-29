import * as React from "react";
import { Input } from "@/components/ui/input";
import { SecurityUtils } from "@/lib/security";
import { cn } from "@/lib/utils";

export interface SecureInputProps extends React.ComponentProps<"input"> {
  sanitize?: boolean;
  preventPaste?: boolean;
  maxLength?: number;
}

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ className, sanitize = true, preventPaste = false, maxLength, onChange, onPaste, ...props }, ref) => {
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      if (maxLength && value.length > maxLength) {
        value = value.slice(0, maxLength);
      }
      
      if (sanitize) {
        value = SecurityUtils.sanitizeInput(value);
      }
      
      // Update the input value
      e.target.value = value;
      
      if (onChange) {
        onChange(e);
      }
    }, [sanitize, maxLength, onChange]);

    const handlePaste = React.useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
      if (preventPaste) {
        e.preventDefault();
        return;
      }
      
      if (onPaste) {
        onPaste(e);
      }
    }, [preventPaste, onPaste]);

    return (
      <Input
        className={cn(className)}
        ref={ref}
        onChange={handleChange}
        onPaste={handlePaste}
        maxLength={maxLength}
        {...props}
      />
    );
  }
);

SecureInput.displayName = "SecureInput";

export { SecureInput };