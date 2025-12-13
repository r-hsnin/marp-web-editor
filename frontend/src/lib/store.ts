import { create } from 'zustand';

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

export const useEditorStore = create<EditorState>((set) => ({
  markdown: `# Marp Slide Example

---

## Slide 1

- Bullet 1
- Bullet 2

---

## Slide 2

![bg right](https://picsum.photos/800/600)

Content on the left
`,
  setMarkdown: (markdown) => set({ markdown }),
  theme: 'default',
  setTheme: (theme) => set({ theme }),
  fontSize: 14,
  setFontSize: (fontSize) => set({ fontSize }),
  isChatOpen: false,
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
}));
