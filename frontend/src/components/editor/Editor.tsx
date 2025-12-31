import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { githubLight } from '@uiw/codemirror-theme-github';
import CodeMirror from '@uiw/react-codemirror';
import React from 'react';
import { AIFloatingButton } from '@/components/editor/AIFloatingButton';

import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { useTheme } from '@/components/theme-provider';
import { FrontmatterProcessor } from '@/lib/marp/frontmatterProcessor';
import { useEditorStore } from '@/lib/store';

// Define extensions outside component to avoid re-creation on every render
const extensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
];

// Define basicSetup options as a constant
const basicSetupOptions = {
  lineNumbers: true,
  highlightActiveLineGutter: true,
  highlightSpecialChars: true,
  history: true,
  foldGutter: true,
  drawSelection: true,
  dropCursor: true,
  allowMultipleSelections: true,
  indentOnInput: true,
  syntaxHighlighting: true,
  bracketMatching: true,
  closeBrackets: true,
  autocompletion: true,
  rectangularSelection: true,
  crosshairCursor: true,
  highlightActiveLine: true,
  highlightSelectionMatches: true,
  closeBracketsKeymap: true,
  defaultKeymap: true,
  searchKeymap: true,
  historyKeymap: true,
  foldKeymap: true,
  completionKeymap: true,
  lintKeymap: true,
} as const;

export const Editor: React.FC = () => {
  const {
    markdown: content,
    setMarkdown,
    fontSize,
    openChat,
    isAIAvailable,
    checkAIStatus,
  } = useEditorStore();
  const { resolvedTheme } = useTheme();
  const [view, setView] = React.useState<EditorView | null>(null);

  // Keep content in ref to avoid onChange dependency on content
  const contentRef = React.useRef(content);
  React.useLayoutEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Check AI availability on mount
  React.useEffect(() => {
    checkAIStatus();
  }, [checkAIStatus]);

  // Extract content for display
  const displayContent = React.useMemo(() => {
    const { content: extractedContent } = FrontmatterProcessor.extractFrontmatter(content);
    return extractedContent;
  }, [content]);

  const onChange = React.useCallback(
    (value: string) => {
      // Merge new content with existing frontmatter
      const newMarkdown = FrontmatterProcessor.mergeContentWithFrontmatter(
        contentRef.current,
        value,
      );
      setMarkdown(newMarkdown);
    },
    [setMarkdown],
  );

  const onCreateEditor = React.useCallback((view: EditorView) => {
    setView(view);
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background/50">
      <EditorToolbar view={view} />
      <div className="flex-1 overflow-hidden relative group">
        <CodeMirror
          value={displayContent}
          height="100%"
          extensions={extensions}
          onChange={onChange}
          onCreateEditor={onCreateEditor}
          theme={resolvedTheme === 'dark' ? oneDark : githubLight}
          className="h-full"
          style={{ fontSize: `${fontSize}px` }}
          basicSetup={basicSetupOptions}
        />

        <div className="absolute bottom-6 right-6 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isAIAvailable && <AIFloatingButton onClick={openChat} />}
        </div>
      </div>
    </div>
  );
};
