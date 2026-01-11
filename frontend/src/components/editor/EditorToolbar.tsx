import type { EditorView } from '@codemirror/view';
import {
  Bold,
  CheckSquare,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Strikethrough,
  Table,
  Type,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { ImageUpload } from '@/components/editor/ImageUpload';
import { PanelSwitcher } from '@/components/editor/PanelSwitcher';
import { TemplateSelector } from '@/components/editor/TemplateSelector';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  insertCodeBlock,
  insertLink,
  toggleBold,
  toggleHeading,
  toggleItalic,
  toggleOrderedList,
  toggleStrikethrough,
  toggleTaskList,
  toggleUnorderedList,
} from '@/lib/editor-commands';
import { useEditorStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  view: EditorView | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ view }) => {
  const { fontSize, setFontSize, isAIAvailable } = useEditorStore();
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);

  const handleImageInsert = useCallback(
    (markdown: string) => {
      if (!view) return;
      const { state, dispatch } = view;
      const selection = state.selection.main;
      dispatch({
        changes: { from: selection.from, to: selection.to, insert: markdown },
        selection: { anchor: selection.from + markdown.length },
      });
      view.focus();
    },
    [view],
  );

  const insertTable = useCallback(() => {
    if (!view) return;
    const { state, dispatch } = view;
    const selection = state.selection.main;
    const tableTemplate = '| Header | Header |\n| --- | --- |\n| Cell | Cell |';
    dispatch({
      changes: { from: selection.from, to: selection.to, insert: tableTemplate },
      selection: { anchor: selection.from, head: selection.from + tableTemplate.length },
    });
    view.focus();
  }, [view]);

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];

  return (
    <div className="flex items-center p-1 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-10 w-full z-10 relative">
      <TooltipProvider delayDuration={300}>
        {/* Left Section */}
        <div className="flex items-center gap-1 px-2 shrink-0">
          <span className="hidden md:inline text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            Editor
          </span>
          <Separator orientation="vertical" className="hidden md:block h-3 mx-1 bg-border/50" />
          <TemplateSelector />
        </div>

        <Separator orientation="vertical" className="h-5 bg-border/50" />

        {/* Dropdowns - Desktop: separate, Mobile: combined */}
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1 px-1">
          {/* Style Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                Style
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => view && toggleBold(view)} className="gap-2">
                <Bold className="h-4 w-4" /> Bold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleItalic(view)} className="gap-2">
                <Italic className="h-4 w-4" /> Italic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleStrikethrough(view)} className="gap-2">
                <Strikethrough className="h-4 w-4" /> Strikethrough
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Heading Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                Heading
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => view && toggleHeading(view, 1)} className="gap-2">
                <Heading1 className="h-4 w-4" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleHeading(view, 2)} className="gap-2">
                <Heading2 className="h-4 w-4" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleHeading(view, 3)} className="gap-2">
                <Heading3 className="h-4 w-4" /> Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* List Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                List
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => view && toggleUnorderedList(view)} className="gap-2">
                <List className="h-4 w-4" /> Bullet List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleOrderedList(view)} className="gap-2">
                <ListOrdered className="h-4 w-4" /> Numbered List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleTaskList(view)} className="gap-2">
                <CheckSquare className="h-4 w-4" /> Task List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile: Format dropdown */}
        <div className="flex md:hidden items-center px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              >
                Format
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => view && toggleBold(view)} className="gap-2">
                <Bold className="h-4 w-4" /> Bold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleItalic(view)} className="gap-2">
                <Italic className="h-4 w-4" /> Italic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleStrikethrough(view)} className="gap-2">
                <Strikethrough className="h-4 w-4" /> Strikethrough
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem onClick={() => view && toggleHeading(view, 1)} className="gap-2">
                <Heading1 className="h-4 w-4" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleHeading(view, 2)} className="gap-2">
                <Heading2 className="h-4 w-4" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleHeading(view, 3)} className="gap-2">
                <Heading3 className="h-4 w-4" /> Heading 3
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem onClick={() => view && toggleUnorderedList(view)} className="gap-2">
                <List className="h-4 w-4" /> Bullet List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleOrderedList(view)} className="gap-2">
                <ListOrdered className="h-4 w-4" /> Numbered List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => view && toggleTaskList(view)} className="gap-2">
                <CheckSquare className="h-4 w-4" /> Task List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="hidden md:block h-5 bg-border/50" />

        {/* Icon Buttons */}
        <div className="flex items-center gap-1 px-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => view && insertLink(view)}
              >
                <Link className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => setIsImageUploadOpen(true)}
              >
                <Image className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => view && insertCodeBlock(view)}
              >
                <Code className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Code Block</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={insertTable}
              >
                <Table className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Table</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1" />

        {/* Right Section */}
        <div className="flex items-center gap-2 px-2 shrink-0">
          {isAIAvailable && (
            <>
              <PanelSwitcher className="hidden md:flex bg-muted rounded-md p-0.5" />
              <Separator orientation="vertical" className="hidden md:block h-5 bg-border/50" />
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <Type className="h-3.5 w-3.5" />
                {fontSize}px
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {fontSizes.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={cn('text-xs', fontSize === size && 'bg-accent')}
                >
                  {size}px
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>

      <ImageUpload
        open={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
};
