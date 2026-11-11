"use client";
import { Dialog } from "@animate-ui/react/primitives/base-ui/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeLabel = "Close panel",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void | boolean;
  title: string;
  description: string;
  children: ReactNode;
  closeLabel?: string;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next, details) => {
        if (onOpenChange(next) === false) details.cancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-foreground/25 dark:bg-black/40 backdrop-blur-xs" />
        <Dialog.Popup
          data-side="right"
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l bg-card text-foreground shadow-xl"
        >
          <header className="relative border-b p-6 pr-18">
            <Dialog.Title className="text-heading font-medium">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-ui text-muted-foreground">
              {description}
            </Dialog.Description>
            <Dialog.Close
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4"
                />
              }
            >
              <X />
              <span className="sr-only">{closeLabel}</span>
            </Dialog.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
            {children}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
