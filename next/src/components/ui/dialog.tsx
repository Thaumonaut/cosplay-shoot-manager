"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// DialogController context provides a small API children can use to
// register a submit handler, set/get result data, and trigger a submit
// which optionally forwards the data to a parent-provided onSave callback.
type SubmitHandler = () => Promise<any> | any;

type DialogController = {
  registerSubmit: (fn: SubmitHandler) => void;
  unregisterSubmit: () => void;
  triggerSubmit: () => Promise<any>;
  setResult: (data: any) => void;
  getResult: () => any;
};

const DialogControllerContext = React.createContext<DialogController | null>(null);

function useDialogController() {
  const ctx = React.useContext(DialogControllerContext);
  if (!ctx) throw new Error("useDialogController must be used within a Dialog");
  return ctx;
}

// Wrap the radix Root so we can provide the controller context to children.
function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root> & { onSave?: (data: any) => Promise<any> | void }) {
  const { children, onSave, ...rest } = props as any;
  const submitRef = React.useRef<SubmitHandler | null>(null);
  const resultRef = React.useRef<any>(null);

  const registerSubmit = (fn: SubmitHandler) => {
    submitRef.current = fn;
  };

  const unregisterSubmit = () => {
    submitRef.current = null;
  };

  const setResult = (data: any) => {
    resultRef.current = data;
  };

  const getResult = () => resultRef.current;

  const triggerSubmit = async () => {
    let submittedResult: any = undefined;
    if (submitRef.current) {
      // call the registered submit handler (child form) and await result
      submittedResult = await Promise.resolve(submitRef.current());
    }
    // allow parent to persist result to server via onSave
    try {
      if (onSave) {
        // prefer submittedResult but fall back to setResult
        await Promise.resolve(onSave(submittedResult ?? resultRef.current));
      }
    } catch (err) {
      // swallow here; the child submit handler is responsible for its own errors
      // parent can handle errors via onSave if desired
      console.error("Dialog onSave handler failed:", err);
    }
    return submittedResult ?? resultRef.current;
  };

  const controller: DialogController = {
    registerSubmit,
    unregisterSubmit,
    triggerSubmit,
    setResult,
    getResult,
  };

  return (
    <DialogPrimitive.Root {...(rest as any)}>
      <DialogControllerContext.Provider value={controller}>
        {children}
      </DialogControllerContext.Provider>
    </DialogPrimitive.Root>
  );
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const innerRef = React.useRef<HTMLDivElement | null>(null);

  // Expose inner ref to forwarded ref
  React.useImperativeHandle(ref, () => innerRef.current as any, [innerRef]);

  // When Radix triggers auto-focus on open, prevent the default and focus the
  // first real input (input/textarea/contenteditable) so the caret appears.
  // Radix expects a DOM Event; accept any here and prevent default when possible
  const handleOpenAutoFocus = (e: any) => {
    try {
      // prevent Radix from focusing the content root
      e.preventDefault();
    } catch {
      // ignore
    }

    // Defer to allow DOM to settle, then find first focusable text input.
    // Prefer elements that explicitly opt-in to dialog autofocus with
    // data-dialog-autofocus so we don't accidentally focus file inputs or
    // other controls that appear earlier in DOM order.
    // Mark that a dialog is opening so other components can avoid acting on
    // transient focus/blur events during the mount/focus dance. This helps
    // components like InlineEdit ignore spurious onBlur handlers during open.
    try {
      (window as any).__dialogOpening = true;
    } catch {}

    setTimeout(() => {
      const root = innerRef.current as HTMLElement | null;
      if (!root) return;
      const selector = '[data-dialog-autofocus], input:not([type=hidden]), textarea, [contenteditable="true"]';
      const el = root.querySelector<HTMLElement>(selector) as HTMLElement | null;
        if (el) {
        try {
          // Focus the element. Avoid calling blur() here because that can
          // trigger onBlur handlers (e.g. InlineEdit) which may save and
          // immediately exit edit mode, removing the caret. Let focus alone
          // set the caret/selection.
          (el as any).focus?.();
        } catch {}

        // Re-run focus after next tick in case React replaced the input node when
        // its internal state (e.g., InlineEdit switching out readOnly) caused a
        // new element to mount. This ensures the final node receives focus and
        // selection.
        setTimeout(() => {
          try {
            const root2 = innerRef.current as HTMLElement | null;
            if (!root2) return;
            const el2 = root2.querySelector<HTMLElement>(selector) as HTMLElement | null;
            if (!el2) return;
            try { (el2 as any).focus?.(); } catch {}
            if (el2 instanceof HTMLInputElement || el2 instanceof HTMLTextAreaElement) {
              const len2 = (el2 as any).value?.length ?? 0;
              try { el2.setSelectionRange?.(len2, len2); } catch {}
            } else {
              const sel2 = window.getSelection?.();
              if (sel2) {
                sel2.removeAllRanges();
                const range2 = document.createRange();
                range2.selectNodeContents(el2);
                range2.collapse(false);
                sel2.addRange(range2);
              }
            }
          } catch {}
        }, 0);
      }
      // Clear the dialog opening flag after a short window when focus has
      // had a chance to stabilize.
      setTimeout(() => {
        try {
          (window as any).__dialogOpening = false;
        } catch {}
      }, 150);
    }, 0);
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={innerRef}
        onOpenAutoFocus={handleOpenAutoFocus}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[80%] overflow-y-auto",
        className
      )}
        {...props}
      >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4 sticky top-0" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

// Convenience hook for child components inside a Dialog to interact with
// the controller (register submit handlers or set result data).
export function useDialog() {
  return useDialogController();
}

// Like useDialog but returns null when not rendered inside a Dialog controller.
export function useOptionalDialog() {
  return React.useContext(DialogControllerContext);
}
