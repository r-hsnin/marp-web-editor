import type { UIMessage } from '@ai-sdk/react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: UIMessage[];
  intents: Record<string, string>;
}

interface ChatStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
  createSession: () => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  updateSession: (id: string, messages: UIMessage[], intents: Record<string, string>) => void;
  getActiveSession: () => ChatSession | null;
}

const generateId = () => crypto.randomUUID();

const generateTitle = (messages: UIMessage[]): string => {
  const firstUserMessage = messages.find((m) => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  const text = firstUserMessage.parts?.find((p) => p.type === 'text');
  if (!text || text.type !== 'text') return 'New Chat';
  return text.text.slice(0, 30) + (text.text.length > 30 ? '...' : '');
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createSession: () => {
        const id = generateId();
        const newSession: ChatSession = {
          id,
          title: 'New Chat',
          createdAt: Date.now(),
          messages: [],
          intents: {},
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      switchSession: (id) => {
        set({ activeSessionId: id });
      },

      deleteSession: (id) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          const newActiveId =
            state.activeSessionId === id ? (newSessions[0]?.id ?? null) : state.activeSessionId;
          return { sessions: newSessions, activeSessionId: newActiveId };
        });
      },

      updateSession: (id, messages, intents) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id
              ? { ...s, messages, intents, title: generateTitle(messages) || s.title }
              : s,
          ),
        }));
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((s) => s.id === activeSessionId) ?? null;
      },
    }),
    {
      name: 'marp-chat-sessions',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    },
  ),
);
