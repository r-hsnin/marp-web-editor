import { Wand2 } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AIFloatingButtonProps {
  onClick?: () => void;
  className?: string;
}

export const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({ onClick, className }) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className={cn(
              'h-12 w-12 rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-xl',
              'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-0',
              'hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600',
              className,
            )}
            onClick={onClick}
          >
            <Wand2 className="h-6 w-6" />
            <span className="sr-only">AI Generate</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="flex flex-col gap-1">
          <p className="font-semibold">AI Generate</p>
          <p className="text-xs text-muted-foreground">Create slides with AI</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
