import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Editor } from "@/components/editor/Editor";
import { Preview } from "@/components/editor/Preview";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { Footer } from "@/components/Footer";

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-lg shadow-primary/20 overflow-hidden">
            <img src="/icon.png" alt="Marp Web Editor" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Marp Web Editor
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-0.5 rounded-md border border-border/50 bg-secondary/30 p-0.5 backdrop-blur-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm transition-all"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-3 bg-border/50" />

              <ModeToggle />
            </div>

            <Button
              variant="default"
              size="sm"
              className="h-8 gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 text-xs px-3"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </TooltipProvider>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-background">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={50} minSize={30} className="bg-background flex flex-col">

            <div className="flex-1 relative">
              <Editor />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border hover:bg-primary/50 transition-colors w-px data-[resize-handle-active]:bg-primary data-[resize-handle-active]:w-1" />

          <ResizablePanel defaultSize={50} minSize={30} className="bg-muted/10 flex flex-col">

            <div className="flex-1 p-0 bg-muted/10 relative">
              <Preview />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Footer />
    </div>
  );
};
