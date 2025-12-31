import { LayoutTemplate, Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchTemplate, fetchTemplates, type Template } from '@/lib/api';
import { FrontmatterProcessor } from '@/lib/marp/frontmatterProcessor';
import { useThemeStore } from '@/lib/marp/themeStore';
import { useEditorStore } from '@/lib/store';

export const TemplateSelector: React.FC = () => {
  const { setMarkdown } = useEditorStore();
  const { setActiveTheme, availableThemes } = useThemeStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const list = await fetchTemplates();
        setTemplates(list);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId || isApplying) return;

    setIsApplying(true);
    try {
      const content = await fetchTemplate(selectedTemplateId);
      setMarkdown(content);

      // テンプレートのフロントマターからテーマを取得して切り替え
      const settings = FrontmatterProcessor.parseSettings(content);
      if (settings.theme && availableThemes.includes(settings.theme)) {
        setActiveTheme(settings.theme);
      }
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setIsApplying(false);
      setSelectedTemplateId(null);
    }
  };

  if (templates.length === 0 && !isLoading) {
    return null;
  }

  const manuals = templates.filter((t) => t.category === 'manual');
  const templateItems = templates.filter((t) => t.category === 'template');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-muted-foreground hover:text-foreground"
            disabled={isLoading || isApplying}
          >
            {isApplying ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LayoutTemplate className="h-3.5 w-3.5" />
            )}
            Templates
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {isLoading ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          ) : (
            <>
              {manuals.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className="gap-2 cursor-pointer p-2 items-start"
                >
                  <span className="text-base leading-none mt-0.5">{template.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-xs">{template.name}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {template.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              {manuals.length > 0 && templateItems.length > 0 && <DropdownMenuSeparator />}
              {templateItems.map((template) => (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className="gap-2 cursor-pointer p-2 items-start"
                >
                  <span className="text-base leading-none mt-0.5">{template.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-xs">
                      {template.name}
                      {template.theme && (
                        <span className="text-muted-foreground font-normal ml-1">
                          ({template.theme})
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {template.description}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={!!selectedTemplateId}
        onOpenChange={(open: boolean) => !open && setSelectedTemplateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current editor content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyTemplate}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
