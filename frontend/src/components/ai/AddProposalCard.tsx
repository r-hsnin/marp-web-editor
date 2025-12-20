import { Check, Plus, RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

interface AddProposalCardProps {
  toolCallId: string;
  input:
    | { insertAfter: number; newMarkdown: string; replaceAll: boolean; reason: string }
    | undefined;
  output?: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  onApply: (
    toolCallId: string,
    insertAfter: number,
    newMarkdown: string,
    replaceAll: boolean,
  ) => void;
  onDiscard: (toolCallId: string, toolName: 'propose_add') => void;
}

export function AddProposalCard({
  toolCallId,
  input,
  output,
  state,
  onApply,
  onDiscard,
}: AddProposalCardProps) {
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

  const { insertAfter, newMarkdown, replaceAll, reason } = input;
  const slideCount = newMarkdown?.split(/\n---\n/).length ?? 1;

  let titleText: string;
  let Icon = Plus;
  if (replaceAll) {
    titleText = `Replace All (${slideCount} slides)`;
    Icon = RefreshCw;
  } else if (slideCount > 1) {
    const positionText =
      insertAfter === -1 ? 'at the beginning' : `after Slide #${insertAfter + 1}`;
    titleText = `Add ${slideCount} Slides (${positionText})`;
  } else {
    const positionText =
      insertAfter === -1 ? 'at the beginning' : `after Slide #${insertAfter + 1}`;
    titleText = `Add New Slide (${positionText})`;
  }

  return (
    <Card className={`w-full ${isPending ? 'border-primary' : 'opacity-70'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Icon className="w-4 h-4" />
            {titleText}
          </span>
          {isPending && (
            <span className="text-xs text-primary animate-pulse">Waiting for review</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2 pb-2">
        <div className="text-muted-foreground italic">{reason}</div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">New Content</div>
          <div className="bg-muted p-2 rounded-md text-xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap">
            {newMarkdown ?? 'Loading...'}
          </div>
        </div>
      </CardContent>
      {isPending && (
        <CardFooter className="flex gap-2 justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDiscard(toolCallId, 'propose_add')}
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-1" />
            Discard
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onApply(toolCallId, insertAfter, newMarkdown, replaceAll)}
          >
            <Check className="w-4 h-4 mr-1" />
            {replaceAll ? 'Replace' : 'Add'}
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
              <Check className="w-3 h-3 mr-1" /> {replaceAll ? 'Replaced' : 'Added'}
            </span>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
