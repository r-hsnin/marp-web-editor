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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Template, fetchTemplate, fetchTemplates } from '@/lib/api';
import { useEditorStore } from '@/lib/store';
import { LayoutTemplate, Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

export const TemplateSelector: React.FC = () => {
  const { setMarkdown } = useEditorStore();
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
        <DropdownMenuContent align="end" className="w-60">
          {isLoading ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          ) : (
            templates.map((template) => (
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
            ))
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
