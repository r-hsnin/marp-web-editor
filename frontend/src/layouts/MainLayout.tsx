import type React from 'react';
import { useEffect } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { ChatView } from '@/components/ai/ChatView';
import { Editor } from '@/components/editor/Editor';
import { Preview } from '@/components/editor/Preview';
import { Footer } from '@/components/Footer';
import { ExportMenu } from '@/components/header/ExportMenu';
import { ModeToggle } from '@/components/mode-toggle';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TooltipProvider } from '@/components/ui/tooltip';

import { fetchThemes } from '@/lib/api';
import { logger } from '@/lib/logger';
import { useThemeStore } from '@/lib/marp/themeStore';
import { useEditorStore } from '@/lib/store';

export const MainLayout: React.FC = () => {
  const { setAvailableThemes } = useThemeStore();
  const { isChatOpen, closeChat, mobileView, setMobileView } = useEditorStore();
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    fetchThemes()
      .then(setAvailableThemes)
      .catch((err) => logger.warn('Failed to fetch themes:', err));
  }, [setAvailableThemes]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-lg shadow-primary/20 overflow-hidden ring-1 ring-white/10">
            <img
              src={`${import.meta.env.BASE_URL}icon.png`}
              alt="Marp Web Editor"
              className="h-full w-full object-cover"
            />
          </div>
          {!isMobile && (
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight">Marp Web Editor</h1>
            </div>
          )}
        </div>

        {isMobile && (
          <ToggleGroup
            type="single"
            value={mobileView}
            onValueChange={(v: string) => v && setMobileView(v as 'editor' | 'preview')}
            className="bg-muted rounded-lg p-1"
          >
            <ToggleGroupItem
              value="editor"
              aria-label="Editor mode"
              className="rounded-md px-4 py-1.5 text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              Editor
            </ToggleGroupItem>
            <ToggleGroupItem
              value="preview"
              aria-label="Preview mode"
              className="rounded-md px-4 py-1.5 text-sm data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              Preview
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        <div className="flex items-center gap-3">
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-1 rounded-full border border-border/50 bg-secondary/30 p-1 backdrop-blur-sm">
              <ModeToggle />
            </div>

            <ExportMenu />
          </TooltipProvider>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-background">
        {isMobile ? (
          mobileView === 'editor' ? (
            <Editor />
          ) : (
            <Preview />
          )
        ) : (
          <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
            <ResizablePanel defaultSize={50} minSize={30} className="bg-background flex flex-col">
              <div className="flex-1 relative overflow-hidden">
                <Editor />
              </div>
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="bg-border hover:bg-primary/50 transition-colors w-px data-[resize-handle-active]:bg-primary data-[resize-handle-active]:w-1"
            />

            <ResizablePanel defaultSize={50} minSize={30} className="bg-muted/10 flex flex-col">
              <div className="flex-1 p-0 bg-muted/10 relative overflow-hidden">
                <Preview />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      <Footer />

      <Dialog open={isChatOpen} onOpenChange={closeChat}>
        <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">AI Assistant</DialogTitle>
          <DialogDescription className="sr-only">
            Chat with AI Assistant to generate slides
          </DialogDescription>
          <div className="flex-1 min-h-0 flex flex-col">
            <ChatView />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
