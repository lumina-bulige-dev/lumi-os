type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  [key: string]: any;
};

export function useToast() {
  return {
    toast: () => {},
    toasts: [] as Toast[],
    dismiss: () => {},
  };
}
