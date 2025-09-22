"use client"

import * as React from "react"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false)
      }
    }
    if (open) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>
}

interface DialogHeaderProps {
  children: React.ReactNode
}
export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => <div className="mb-4">{children}</div>

interface DialogTitleProps {
  children: React.ReactNode
}
export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
)

interface DialogDescriptionProps {
  children: React.ReactNode
}
export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => (
  <p className="text-sm text-gray-500">{children}</p>
)

interface DialogFooterProps {
  children: React.ReactNode
}
export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => (
  <div className="flex justify-end space-x-2 mt-4">{children}</div>
)
