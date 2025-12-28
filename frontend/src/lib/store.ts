import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EditorState {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: number;
  setFontSize: (fontSize: number) => void;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

const DEFAULT_MARKDOWN = `# Marp Slide Example

---

## Slide 1

- Bullet 1
- Bullet 2

---

## Slide 2

![bg right](https://picsum.photos/800/600)

Content on the left
`;

// Debounced storage to avoid performance issues on every keystroke
const debouncedStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (name: string, value: unknown) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.setItem(name, JSON.stringify(value));
      }, 5000); // Save after 5 seconds of inactivity
    };
  })(),
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      markdown: DEFAULT_MARKDOWN,
      setMarkdown: (markdown) => set({ markdown }),
      theme: 'default',
      setTheme: (theme) => set({ theme }),
      fontSize: 14,
      setFontSize: (fontSize) => set({ fontSize }),
      isChatOpen: false,
      openChat: () => set({ isChatOpen: true }),
      closeChat: () => set({ isChatOpen: false }),
    }),
    {
      name: 'marp-editor-storage',
      storage: debouncedStorage,
      partialize: (state) => ({
        markdown: state.markdown,
        fontSize: state.fontSize,
      }),
    },
  ),
);
