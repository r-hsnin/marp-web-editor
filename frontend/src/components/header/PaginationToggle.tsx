import { FileText } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PaginationToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const PaginationToggle: React.FC<PaginationToggleProps> = ({ enabled, onToggle }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            'h-7 w-7 transition-all',
            enabled
              ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="sr-only">Toggle pagination</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{enabled ? 'Hide page numbers' : 'Show page numbers'}</TooltipContent>
    </Tooltip>
  );
};
