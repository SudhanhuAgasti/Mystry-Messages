"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-emerald-400" />
        ),
        info: (
          <InfoIcon className="size-5 text-amber-400" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-400" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-rose-500" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin text-amber-400" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group font-sans border rounded-2xl shadow-2xl p-4 flex items-center gap-3 bg-[#121218] border-neutral-800 text-white backdrop-blur-xl",
          title: "text-sm font-black tracking-wide text-white",
          description: "text-xs font-medium text-neutral-300 mt-0.5 leading-relaxed",
          actionButton: "bg-amber-400 text-black font-bold text-xs rounded-lg px-3 py-1.5",
          cancelButton: "bg-neutral-800 text-white font-medium text-xs rounded-lg px-3 py-1.5",
          error: "!bg-[#181114] !border-red-500/50 !text-white [&_[data-title]]:!text-red-400 [&_[data-description]]:!text-neutral-300",
          success: "!bg-[#101914] !border-emerald-500/50 !text-white [&_[data-title]]:!text-emerald-400 [&_[data-description]]:!text-neutral-300",
          warning: "!bg-[#1b170e] !border-amber-500/50 !text-white [&_[data-title]]:!text-amber-400 [&_[data-description]]:!text-neutral-300",
          info: "!bg-[#12121c] !border-sky-500/50 !text-white [&_[data-title]]:!text-sky-400 [&_[data-description]]:!text-neutral-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
