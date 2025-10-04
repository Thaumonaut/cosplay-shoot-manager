import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  type?: "text" | "email" | "number" | "date" | "datetime-local";
  multiline?: boolean;
  "data-testid"?: string;
}

export function EditableField({
  value,
  onChange,
  placeholder = "Click to add...",
  className = "",
  textClassName = "",
  disabled = false,
  type = "text",
  multiline = false,
  "data-testid": testId,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (!multiline && inputRef.current) {
        inputRef.current.focus();
        if (type === "text" || type === "email") {
          inputRef.current.select();
        }
      }
    }
  }, [isEditing, type, multiline]);

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
    if (e.key === "Enter" && !multiline) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (disabled) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className={cn(textClassName)}>
          {value || <span className="text-muted-foreground italic">{placeholder}</span>}
        </span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={cn("flex items-start gap-2", className)}>
        {multiline ? (
          <Textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            rows={4}
            {...(testId && { "data-testid": testId })}
          />
        ) : (
          <Input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            {...(testId && { "data-testid": testId })}
          />
        )}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleSave}
          className="h-8 w-8 flex-shrink-0"
          {...(testId && { "data-testid": `${testId}-save` })}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          className="h-8 w-8 flex-shrink-0"
          {...(testId && { "data-testid": `${testId}-cancel` })}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("group flex items-center gap-2", className)}>
      <span className={cn(textClassName, !value && "text-muted-foreground italic", multiline && "whitespace-pre-wrap")}>
        {value || placeholder}
      </span>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        {...(testId && { "data-testid": `${testId}-edit` })}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
}
