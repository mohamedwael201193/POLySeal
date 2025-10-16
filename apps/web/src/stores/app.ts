import { create } from 'zustand';

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

type PendingTx = {
  hash: string;
  description: string;
  timestamp: number;
};

type AppState = {
  // UI state
  theme: 'dark';
  
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Pending transactions
  pendingTxs: PendingTx[];
  addPendingTx: (tx: Omit<PendingTx, 'timestamp'>) => void;
  removePendingTx: (hash: string) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  
  pendingTxs: [],
  addPendingTx: (tx) =>
    set((state) => ({
      pendingTxs: [...state.pendingTxs, { ...tx, timestamp: Date.now() }],
    })),
  removePendingTx: (hash) =>
    set((state) => ({
      pendingTxs: state.pendingTxs.filter((tx) => tx.hash !== hash),
    })),
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
