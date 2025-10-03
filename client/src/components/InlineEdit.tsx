import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  type?: "text" | "email" | "number" | "date" | "datetime-local";
  "data-testid"?: string;
}

export function InlineEdit({
  value,
  onChange,
  placeholder = "Click to edit...",
  className = "",
  textClassName = "",
  disabled = false,
  type = "text",
  "data-testid": testId,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (type === "text" || type === "email") {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === 'Tab') {
      // On Tab or Shift+Tab, commit the edit and move focus to the next/previous
      // focusable element. Prevent default to avoid the browser moving focus
      // before we've committed the value.
      e.preventDefault();
      handleSave();
      const shift = (e as any).shiftKey === true;
      // schedule focus change so the DOM updates (input removed) before focusing
      setTimeout(() => {
        try {
          const el = inputRef.current as HTMLElement | null;
          if (!el) return;
          const focusables = Array.from(
            document.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((node) => !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length));

          if (focusables.length === 0) return;
          const idx = focusables.indexOf(el);
          let nextIndex = idx;
          if (idx === -1) {
            // If current input isn't in the list, find its position by document order
            nextIndex = shift ? focusables.length - 1 : 0;
          } else {
            nextIndex = shift ? Math.max(0, idx - 1) : Math.min(focusables.length - 1, idx + 1);
          }
          const target = focusables[nextIndex];
          if (target) target.focus();
        } catch (err) {
          // swallow focus errors
        }
      }, 0);
    }
  };

  if (disabled) {
    return (
      <div className={cn("py-2 px-1", textClassName, className)}>
        {value || <span className="text-muted-foreground">{placeholder}</span>}
      </div>
    );
  }
  // Render a real input element for accessibility. When not editing we keep
  // it readOnly and visually undecorated so it appears like plain text but
  // remains focusable via keyboard. On focus we enter editing mode and let
  // the normal handlers manage selection and saving.
  return (
    <Input
      ref={inputRef}
      type={type}
      value={editValue}
      readOnly={!isEditing}
      onFocus={() => {
        if (!isEditing) setIsEditing(true);
      }}
      onChange={(e) => setEditValue(e.target.value)}
      // Delay save on blur to avoid interrupting native Tab navigation.
      onBlur={() => setTimeout(handleSave, 0)}
      onKeyDown={handleKeyDown}
      // When not editing, visually style the input to look like plain text
      className={cn(
        className,
        !isEditing
          ? cn("bg-transparent border-0 p-0 text-inherit placeholder:text-muted-foreground cursor-text", textClassName)
          : undefined
      )}
      data-testid={testId}
      placeholder={placeholder}
    />
  );
}
