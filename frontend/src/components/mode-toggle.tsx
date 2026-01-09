import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/components/theme-provider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const effectiveTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  return (
    <ToggleGroup
      type="single"
      value={effectiveTheme}
      onValueChange={(v) => v && setTheme(v as 'light' | 'dark')}
      className="bg-muted rounded-lg p-0.5"
    >
      <ToggleGroupItem
        value="light"
        aria-label="Light mode"
        className="h-7 w-7 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <Sun className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dark"
        aria-label="Dark mode"
        className="h-7 w-7 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm"
      >
        <Moon className="h-3.5 w-3.5" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
