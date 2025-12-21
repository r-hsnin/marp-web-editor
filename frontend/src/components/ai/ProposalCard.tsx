import { Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface ProposalCardProps {
  toolCallId: string;
  input: { slideIndex: number; newMarkdown: string; reason: string } | undefined;
  output?: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  onApply: (toolCallId: string, result: unknown, slideIndex: number, newMarkdown: string) => void;
  onDiscard: (toolCallId: string, toolName?: 'propose_edit' | 'propose_insert' | 'propose_replace') => void;
  currentContent?: string;
}

export function ProposalCard({
  toolCallId,
  input,
  output,
  state,
  onApply,
  onDiscard,
  currentContent = '',
}: ProposalCardProps) {
  const isPending = state === 'input-available';

  if (!input) {
    return (
      <Card className="w-full opacity-70">
        <CardContent className="py-4">
          <div className="animate-pulse text-xs">Loading proposal...</div>
        </CardContent>
      </Card>
    );
  }

  const { slideIndex, newMarkdown, reason } = input;

  return (
    <Card className={`w-full ${isPending ? 'border-primary' : 'opacity-70'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>Edit Proposal (Slide #{slideIndex + 1})</span>
          {isPending && (
            <span className="text-xs text-primary animate-pulse">Waiting for review</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2 pb-2">
        <div className="text-muted-foreground italic">{reason}</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Before</div>
            <div className="bg-muted p-2 rounded-md text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">
              {currentContent || '(empty)'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">After</div>
            <div className="bg-muted p-2 rounded-md text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">
              {newMarkdown}
            </div>
          </div>
        </div>
      </CardContent>
      {isPending && (
        <CardFooter className="flex gap-2 justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDiscard(toolCallId)}
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-1" />
            Discard
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onApply(toolCallId, 'Applied', slideIndex, newMarkdown)}
          >
            <Check className="w-4 h-4 mr-1" />
            Apply
          </Button>
        </CardFooter>
      )}
      {state === 'output-available' && output && (
        <CardFooter className="pt-2 text-xs text-muted-foreground">
          {output === 'User discarded the proposal' ? (
            <span className="flex items-center text-destructive">
              <X className="w-3 h-3 mr-1" /> Discarded
            </span>
          ) : (
            <span className="flex items-center text-green-500">
              <Check className="w-3 h-3 mr-1" /> Applied
            </span>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
