import {
  Download,
  FileCode,
  FileText,
  Image as ImageIcon,
  Loader2,
  MonitorPlay,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type ExportFormat, exportSlide } from '@/lib/api';
import { useThemeStore } from '@/lib/marp/themeStore';
import { useEditorStore } from '@/lib/store';

export const ExportMenu: React.FC = () => {
  const { markdown } = useEditorStore();
  const { activeThemeId } = useThemeStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportSlide(markdown, format, activeThemeId);
    } catch {
      alert('Failed to export presentation. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={isExporting}
          className="h-8 gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 text-xs px-3"
        >
          {isExporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          <span>PDF Document</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pptx')} className="gap-2 cursor-pointer">
          <MonitorPlay className="h-4 w-4" />
          <span>PowerPoint (PPTX)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('html')} className="gap-2 cursor-pointer">
          <FileCode className="h-4 w-4" />
          <span>HTML Slide</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('png')} className="gap-2 cursor-pointer">
          <ImageIcon className="h-4 w-4" />
          <span>PNG Image (First Slide)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('jpg')} className="gap-2 cursor-pointer">
          <ImageIcon className="h-4 w-4" />
          <span>JPEG Image (First Slide)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
