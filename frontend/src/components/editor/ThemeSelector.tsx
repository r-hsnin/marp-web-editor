import { Check, ChevronsUpDown } from 'lucide-react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/lib/marp/themeStore';

const BUILTIN_THEMES = ['default', 'gaia', 'uncover'];

export const ThemeSelector: React.FC = () => {
  const { activeThemeId, setActiveTheme, availableThemes } = useThemeStore();

  // Combine built-in and available themes, removing duplicates
  const allThemes = Array.from(new Set([...BUILTIN_THEMES, ...availableThemes]));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-[140px] justify-between text-xs text-muted-foreground hover:text-foreground"
        >
          <span className="truncate">
            {activeThemeId.charAt(0).toUpperCase() + activeThemeId.slice(1)}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px]">
        {allThemes.map((theme) => (
          <DropdownMenuItem
            key={theme}
            onSelect={() => setActiveTheme(theme)}
            className="justify-between text-xs"
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
            {activeThemeId === theme && <Check className="h-3 w-3 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
