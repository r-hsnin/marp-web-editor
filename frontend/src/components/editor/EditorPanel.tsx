import { ChatView } from '@/components/ai/ChatView';
import { Editor } from '@/components/editor/Editor';
import { useEditorStore } from '@/lib/store';

export function EditorPanel() {
  const { activePanel } = useEditorStore();

  return (
    <div className="relative h-full w-full">
      {activePanel === 'editor' ? <Editor /> : <ChatView />}
    </div>
  );
}
