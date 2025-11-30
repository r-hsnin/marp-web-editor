import { Separator } from '@/components/ui/separator';
import { useMarp } from '@/hooks/useMarp';
import { useSlides } from '@/hooks/useSlides';
import { useEditorStore } from '@/lib/store';
import { FileText, Layers, Type } from 'lucide-react';
import type React from 'react';

export const Footer: React.FC = () => {
  const { markdown } = useEditorStore();
  const { html } = useMarp(markdown);
  const { totalSlides } = useSlides(html);

  const wordCount = markdown.trim().split(/\s+/).length;
  const charCount = markdown.length;

  return (
    <footer className="h-8 border-t border-border bg-background/80 backdrop-blur-sm flex items-center px-4 justify-between text-[11px] font-medium text-muted-foreground select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
          <Layers className="h-3 w-3" />
          <span>{totalSlides} Slides</span>
        </div>
        <Separator orientation="vertical" className="h-3 bg-border" />
        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
          <FileText className="h-3 w-3" />
          <span>{wordCount} Words</span>
        </div>
        <Separator orientation="vertical" className="h-3 bg-border" />
        <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
          <Type className="h-3 w-3" />
          <span>{charCount} Characters</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="opacity-70">Marp Web Editor</span>
      </div>
    </footer>
  );
};
