import { Pencil, Sparkles } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useEditorStore } from '@/lib/store';

export function PanelSwitcher({ className }: { className?: string }) {
  const { activePanel, setActivePanel } = useEditorStore();

  return (
    <ToggleGroup
      type="single"
      value={activePanel}
      onValueChange={(v) => v && setActivePanel(v as 'editor' | 'ai')}
      className={className ?? 'bg-muted rounded-md p-0.5'}
    >
      <ToggleGroupItem
        value="editor"
        aria-label="Editor mode"
        className="h-6 rounded px-2 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <Pencil className="h-3 w-3 mr-1" />
        Editor
      </ToggleGroupItem>
      <ToggleGroupItem
        value="ai"
        aria-label="AI mode"
        className="h-6 rounded px-2 text-xs text-indigo-400 data-[state=on]:bg-gradient-to-r data-[state=on]:from-indigo-500/90 data-[state=on]:to-purple-500/90 data-[state=on]:text-white data-[state=on]:shadow-sm"
      >
        <Sparkles className="h-3 w-3 mr-1" />
        AI
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
