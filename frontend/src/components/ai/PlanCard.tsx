import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface PlanInput {
  title: string;
  outline: Array<{
    title: string;
    description?: string;
  }>;
  rationale?: string;
}

interface PlanCardProps {
  input: PlanInput | undefined;
}

export function PlanCard({ input }: PlanCardProps) {
  if (!input) {
    return (
      <Card className="w-full opacity-70">
        <CardContent className="py-4">
          <div className="animate-pulse text-xs">Loading plan...</div>
        </CardContent>
      </Card>
    );
  }

  const { title, outline, rationale } = input;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span>{title}</span>
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            {outline.length}枚構成
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <div className="space-y-1.5">
          {outline.map((slide, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: Static list
              key={i}
              className="flex gap-2 text-xs pl-2 border-l-2 border-primary/50"
            >
              <span className="text-muted-foreground w-4 shrink-0">{i + 1}.</span>
              <div>
                <span className="font-medium">{slide.title}</span>
                {slide.description && (
                  <span className="text-muted-foreground ml-1">- {slide.description}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {rationale && <p className="text-xs text-muted-foreground border-t pt-2">{rationale}</p>}
      </CardContent>
    </Card>
  );
}
