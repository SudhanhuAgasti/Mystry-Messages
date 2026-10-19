import { toast } from "sonner";

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | string;
};

export function useToast() {
  return {
    toast: (props: ToastProps) => {
      if (props.variant === "destructive") {
        return toast.error(props.title || "Error", {
          description: props.description,
        });
      }

      if (props.title && props.description) {
        return toast(props.title, {
          description: props.description,
        });
      }

      if (props.title) {
        return toast(props.title);
      }

      if (props.description) {
        return toast(props.description);
      }

      return toast("");
    },

    success: (title: string, description?: string) =>
      toast.success(title, {
        description,
      }),

    error: (title: string, description?: string) =>
      toast.error(title, {
        description,
      }),

    warning: (title: string, description?: string) =>
      toast.warning(title, {
        description,
      }),

    info: (title: string, description?: string) =>
      toast.info(title, {
        description,
      }),

    dismiss: toast.dismiss,
  };
}

export { toast };