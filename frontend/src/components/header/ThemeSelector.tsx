import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, Palette } from 'lucide-react';
import type React from 'react';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const THEMES = [
  { value: 'default', label: 'Default' },
  { value: 'gaia', label: 'Gaia' },
  { value: 'uncover', label: 'Uncover' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="sr-only">
                {THEMES.find((t) => t.value === currentTheme)?.label || 'Theme'}
              </span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Change Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => onThemeChange(theme.value)}
            className="gap-2"
          >
            <div
              className={cn(
                'h-4 w-4 flex items-center justify-center',
                currentTheme === theme.value ? 'opacity-100' : 'opacity-0',
              )}
            >
              <Check className="h-3 w-3" />
            </div>
            {theme.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
