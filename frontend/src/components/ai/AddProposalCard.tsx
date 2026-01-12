import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

type ToolType = 'propose_insert' | 'propose_replace';

interface InsertInput {
  insertAfter: number;
  newMarkdown: string;
  reason: string;
}

interface ReplaceInput {
  newMarkdown: string;
  reason: string;
}

interface AddProposalCardProps {
  toolCallId: string;
  toolType: ToolType;
  input: InsertInput | ReplaceInput | undefined;
  output?: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  onApplyInsert: (toolCallId: string, insertAfter: number, newMarkdown: string) => void;
  onApplyReplace: (toolCallId: string, newMarkdown: string) => void;
  onDiscard: (toolCallId: string, toolName: ToolType) => void;
}

export function AddProposalCard({
  toolCallId,
  toolType,
  input,
  output,
  state,
  onApplyInsert,
  onApplyReplace,
  onDiscard,
}: AddProposalCardProps) {
  const isPending = state === 'input-available';
  const isReplace = toolType === 'propose_replace';

  if (!input) {
    return (
      <Card className="w-full opacity-70">
        <CardContent className="py-4">
          <div className="animate-pulse text-xs">Loading proposal...</div>
        </CardContent>
      </Card>
    );
  }

  const { newMarkdown, reason } = input;
  const insertAfter = isReplace ? -1 : (input as InsertInput).insertAfter;
  const slideCount = newMarkdown?.split(/\n---\n/).length ?? 1;

  let titleText: string;
  let Icon = Plus;
  if (isReplace) {
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

  const handleApply = () => {
    if (isReplace) {
      onApplyReplace(toolCallId, newMarkdown);
    } else {
      onApplyInsert(toolCallId, insertAfter, newMarkdown);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
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
        <AnimatePresence mode="wait">
          {isPending && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CardFooter className="flex gap-2 justify-end pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDiscard(toolCallId, toolType)}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-1" />
                  Discard
                </Button>
                <Button variant="default" size="sm" onClick={handleApply}>
                  <Check className="w-4 h-4 mr-1" />
                  {isReplace ? 'Replace' : 'Add'}
                </Button>
              </CardFooter>
            </motion.div>
          )}
          {state === 'output-available' && output && (
            <motion.div
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <CardFooter className="pt-2 text-xs text-muted-foreground">
                {output === 'User discarded the proposal' ? (
                  <span className="flex items-center text-destructive">
                    <X className="w-3 h-3 mr-1" /> Discarded
                  </span>
                ) : (
                  <span className="flex items-center text-green-500">
                    <Check className="w-3 h-3 mr-1" /> {isReplace ? 'Replaced' : 'Added'}
                  </span>
                )}
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
