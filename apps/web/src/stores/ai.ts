import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

type AIThread = {
  id: string;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
};

type AIState = {
  threads: AIThread[];
  currentThreadId: string | null;
  
  // Actions
  createThread: () => string;
  addMessage: (threadId: string, message: Omit<AIMessage, 'timestamp'>) => void;
  deleteThread: (threadId: string) => void;
  setCurrentThread: (threadId: string | null) => void;
  getCurrentThread: () => AIThread | null;
};

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      threads: [],
      currentThreadId: null,
      
      createThread: () => {
        const id = `thread-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newThread: AIThread = {
          id,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          threads: [...state.threads, newThread],
          currentThreadId: id,
        }));
        
        return id;
      },
      
      addMessage: (threadId, message) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    { ...message, timestamp: Date.now() },
                  ],
                  updatedAt: Date.now(),
                }
              : thread
          ),
        }));
      },
      
      deleteThread: (threadId) => {
        set((state) => ({
          threads: state.threads.filter((t) => t.id !== threadId),
          currentThreadId:
            state.currentThreadId === threadId ? null : state.currentThreadId,
        }));
      },
      
      setCurrentThread: (threadId) => {
        set({ currentThreadId: threadId });
      },
      
      getCurrentThread: () => {
        const { threads, currentThreadId } = get();
        return threads.find((t) => t.id === currentThreadId) || null;
      },
    }),
    {
      name: 'polyseal-ai-storage',
    }
  )
);
