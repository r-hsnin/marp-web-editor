import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE } from './config';

type MobileView = 'editor' | 'preview';

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
  isAIAvailable: boolean;
  checkAIStatus: () => Promise<void>;
  mobileView: MobileView;
  setMobileView: (view: MobileView) => void;
}

const DEFAULT_MARKDOWN = `# Welcome to Marp Web Editor!

Markdown でプレゼンテーションを作成しよう

---

## 主な機能

- **リアルタイムプレビュー** - 編集内容を即座に確認
- **AI アシスタント** - スライド作成をサポート
- **画像アップロード** - ドラッグ&ドロップで挿入
- **エクスポート** - PDF / PPTX / HTML / PNG

---

## テーマとテンプレート

- **テーマ** - 3種類のデフォルトテーマ + カスタムテーマ
- **テンプレート** - 用途別テンプレートをワンクリック適用

ツールバーから選択できます

---

## 使い方

1. 左のエディタで Markdown を編集
2. \`---\` でスライドを区切る
3. 右のプレビューで確認
4. 完成したらエクスポート

---

## Marp 記法の例

\`\`\`markdown
![bg right](画像URL)  <!-- 背景画像 -->
<!-- _class: lead -->  <!-- スライドクラス -->
\`\`\`

詳しくは [Marp 公式ドキュメント](https://marpit.marp.app/) をご覧ください
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
      isAIAvailable: false,
      checkAIStatus: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/ai/status`);
          const { available } = await res.json();
          set({ isAIAvailable: available });
        } catch {
          set({ isAIAvailable: false });
        }
      },
      mobileView: 'editor',
      setMobileView: (mobileView) => set({ mobileView }),
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
