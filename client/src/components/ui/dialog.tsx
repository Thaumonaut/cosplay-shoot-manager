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
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[80%] overflow-y-scroll",
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
))
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
