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
  MoreVertical,
  Strikethrough,
  Table,
  Type,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ImageUpload } from '@/components/editor/ImageUpload';
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
  const { fontSize, setFontSize } = useEditorStore();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(100);
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

  const actions = useMemo(
    () => [
      {
        label: 'Bold',
        icon: Bold,
        action: () => view && toggleBold(view),
      },
      {
        label: 'Italic',
        icon: Italic,
        action: () => view && toggleItalic(view),
      },
      {
        label: 'Strikethrough',
        icon: Strikethrough,
        action: () => view && toggleStrikethrough(view),
      },
      { type: 'separator' },
      {
        label: 'Heading 1',
        icon: Heading1,
        action: () => view && toggleHeading(view, 1),
      },
      {
        label: 'Heading 2',
        icon: Heading2,
        action: () => view && toggleHeading(view, 2),
      },
      {
        label: 'Heading 3',
        icon: Heading3,
        action: () => view && toggleHeading(view, 3),
      },
      { type: 'separator' },
      {
        label: 'Unordered List',
        icon: List,
        action: () => view && toggleUnorderedList(view),
      },
      {
        label: 'Ordered List',
        icon: ListOrdered,
        action: () => view && toggleOrderedList(view),
      },
      {
        label: 'Task List',
        icon: CheckSquare,
        action: () => view && toggleTaskList(view),
      },
      { type: 'separator' },
      {
        label: 'Link',
        icon: Link,
        action: () => view && insertLink(view),
      },
      {
        label: 'Image',
        icon: Image,
        action: () => setIsImageUploadOpen(true),
      },
      {
        label: 'Code Block',
        icon: Code,
        action: () => view && insertCodeBlock(view),
      },
      {
        label: 'Table',
        icon: Table,
        action: () => {
          if (!view) return;
          const { state, dispatch } = view;
          const selection = state.selection.main;
          const tableTemplate = '| Header | Header |\n| --- | --- |\n| Cell | Cell |';
          dispatch({
            changes: { from: selection.from, to: selection.to, insert: tableTemplate },
            selection: { anchor: selection.from, head: selection.from + tableTemplate.length },
          });
          view.focus();
        },
      },
    ],
    [view],
  );

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];

  useLayoutEffect(() => {
    if (!toolbarRef.current) return;

    const calculateVisibleItems = () => {
      if (!toolbarRef.current) return;

      const containerWidth = toolbarRef.current.offsetWidth;
      const itemWidth = 32; // Button width (w-8)
      const gap = 4; // Gap between items
      const separatorWidth = 9; // Separator width + margins
      const moreMenuWidth = 32; // Width of the 'More' menu button

      let currentWidth = 0;
      let count = 0;

      // Always reserve space for the 'More' menu if we might need it
      // But initially we try to fit everything
      const maxAvailableWidth = containerWidth - moreMenuWidth;

      for (let i = 0; i < actions.length; i++) {
        const item = actions[i];
        const width = item.type === 'separator' ? separatorWidth : itemWidth;

        if (currentWidth + width + gap > maxAvailableWidth) {
          break;
        }

        currentWidth += width + gap;
        count++;
      }

      // If we can fit everything without the 'More' menu, use the full count
      // Recalculate without reserving space for 'More' menu to see if ALL fit
      let fullWidth = 0;
      for (let i = 0; i < actions.length; i++) {
        const item = actions[i];
        const width = item.type === 'separator' ? separatorWidth : itemWidth;
        fullWidth += width + gap;
      }

      if (fullWidth <= containerWidth) {
        setVisibleCount(actions.length);
      } else {
        setVisibleCount(count);
      }
    };

    const observer = new ResizeObserver(calculateVisibleItems);
    observer.observe(toolbarRef.current);
    calculateVisibleItems(); // Initial calculation

    return () => observer.disconnect();
  }, [actions]);

  const visibleActions = actions.slice(0, visibleCount);
  const hiddenActions = actions.slice(visibleCount);

  return (
    <div className="flex items-center p-1 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-10 w-full z-10 relative">
      {/* Title Section */}
      <div className="flex items-center gap-2 px-3 shrink-0">
        <span className="hidden md:inline text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
          Editor
        </span>
        <Separator orientation="vertical" className="hidden md:block h-3 bg-border/50" />
        <TemplateSelector />
        <Separator orientation="vertical" className="h-3 bg-border/50" />
      </div>

      {/* Toolbar Items Section (Flexible) */}
      <div ref={toolbarRef} className="flex items-center gap-1 overflow-hidden flex-1 h-full">
        <TooltipProvider delayDuration={300}>
          {visibleActions.map((item, index) =>
            item.type === 'separator' ? (
              <Separator
                // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                key={index}
                orientation="vertical"
                className="h-5 mx-1 bg-border/50 shrink-0"
              />
            ) : (
              <Tooltip
                // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                key={index}
              >
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-background hover:shadow-sm shrink-0"
                    onClick={item.action}
                  >
                    {item.icon && <item.icon className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{item.label}</TooltipContent>
              </Tooltip>
            ),
          )}

          {hiddenActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-background hover:shadow-sm shrink-0"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {hiddenActions.map((item, index) =>
                  item.type === 'separator' ? (
                    <Separator
                      // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                      key={index}
                      className="my-1"
                    />
                  ) : (
                    <DropdownMenuItem
                      // biome-ignore lint/suspicious/noArrayIndexKey: Static list
                      key={index}
                      onClick={item.action}
                      className="gap-2"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TooltipProvider>
      </div>

      {/* Right Controls Section (Fixed/Shrink-0) */}
      <div className="flex items-center gap-1 shrink-0 ml-auto pl-2">
        <Separator orientation="vertical" className="h-5 mx-1 bg-border/50" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-muted-foreground hover:text-primary hover:bg-background hover:shadow-sm font-normal"
            >
              <Type className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">{fontSize}px</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {fontSizes.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => setFontSize(size)}
                className={cn(
                  'text-xs cursor-pointer',
                  fontSize === size && 'bg-accent text-accent-foreground',
                )}
              >
                {size}px
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ImageUpload
        open={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
};
