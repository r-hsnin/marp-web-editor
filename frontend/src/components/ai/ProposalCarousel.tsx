import { getToolName, type ToolUIPart } from 'ai';
import { CheckCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { AddProposalCard } from './AddProposalCard';
import { ProposalCard } from './ProposalCard';

interface ProposalCarouselProps {
  proposals: ToolUIPart[];
  onApplyEdit: (
    toolCallId: string,
    result: unknown,
    slideIndex: number,
    newMarkdown: string,
  ) => void;
  onApplyInsert: (toolCallId: string, insertAfter: number, newMarkdown: string) => void;
  onApplyReplace: (toolCallId: string, newMarkdown: string) => void;
  onApplyAll: (
    proposals: Array<{
      toolCallId: string;
      toolName: 'propose_edit' | 'propose_insert' | 'propose_replace';
      input: { slideIndex?: number; insertAfter?: number; newMarkdown: string };
    }>,
  ) => void;
  onDiscard: (
    toolCallId: string,
    toolName?: 'propose_edit' | 'propose_insert' | 'propose_replace',
  ) => void;
  getSlideContent: (index: number) => string;
}

export function ProposalCarousel({
  proposals,
  onApplyEdit,
  onApplyInsert,
  onApplyReplace,
  onApplyAll,
  onDiscard,
  getSlideContent,
}: ProposalCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const pendingCount = proposals.filter((p) => p.state === 'input-available').length;

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const moveToNextPending = useCallback(
    (excludeIndex: number) => {
      if (!api) return;
      // Find next pending after current
      for (let i = excludeIndex + 1; i < proposals.length; i++) {
        if (proposals[i].state === 'input-available') {
          api.scrollTo(i);
          return;
        }
      }
      // Find pending before current
      for (let i = 0; i < excludeIndex; i++) {
        if (proposals[i].state === 'input-available') {
          api.scrollTo(i);
          return;
        }
      }
    },
    [api, proposals],
  );

  const handleApplyEdit = useCallback(
    (toolCallId: string, result: unknown, slideIndex: number, newMarkdown: string) => {
      onApplyEdit(toolCallId, result, slideIndex, newMarkdown);
      moveToNextPending(current);
    },
    [onApplyEdit, moveToNextPending, current],
  );

  const handleApplyInsert = useCallback(
    (toolCallId: string, insertAfter: number, newMarkdown: string) => {
      onApplyInsert(toolCallId, insertAfter, newMarkdown);
      moveToNextPending(current);
    },
    [onApplyInsert, moveToNextPending, current],
  );

  const handleApplyReplace = useCallback(
    (toolCallId: string, newMarkdown: string) => {
      onApplyReplace(toolCallId, newMarkdown);
      moveToNextPending(current);
    },
    [onApplyReplace, moveToNextPending, current],
  );

  const handleDiscard = useCallback(
    (toolCallId: string, toolName?: 'propose_edit' | 'propose_insert' | 'propose_replace') => {
      onDiscard(toolCallId, toolName);
      moveToNextPending(current);
    },
    [onDiscard, moveToNextPending, current],
  );

  const handleApplyAll = useCallback(() => {
    const pending = proposals.filter((p) => p.state === 'input-available');
    const mapped = pending.map((p) => ({
      toolCallId: p.toolCallId,
      toolName: getToolName(p) as 'propose_edit' | 'propose_insert' | 'propose_replace',
      input: p.input as { slideIndex?: number; insertAfter?: number; newMarkdown: string },
    }));
    onApplyAll(mapped);
  }, [proposals, onApplyAll]);

  return (
    <div className="mt-2 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs text-muted-foreground">
          {current + 1} / {proposals.length}
        </span>
        {pendingCount >= 2 && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleApplyAll}>
            <CheckCheck className="w-3 h-3 mr-1" />
            Apply All ({pendingCount})
          </Button>
        )}
      </div>

      {/* Carousel */}
      <Carousel setApi={setApi} opts={{ watchDrag: false }} className="w-full">
        <CarouselContent className="-ml-2">
          {proposals.map((proposal) => {
            const toolName = getToolName(proposal);
            return (
              <CarouselItem key={proposal.toolCallId} className="pl-2">
                {toolName === 'propose_edit' ? (
                  <ProposalCard
                    toolCallId={proposal.toolCallId}
                    input={
                      proposal.input as
                        | { slideIndex: number; newMarkdown: string; reason: string }
                        | undefined
                    }
                    output={proposal.output as string | undefined}
                    state={proposal.state}
                    onApply={handleApplyEdit}
                    onDiscard={handleDiscard}
                    currentContent={
                      (proposal.input as { slideIndex?: number } | undefined)?.slideIndex !==
                      undefined
                        ? getSlideContent((proposal.input as { slideIndex: number }).slideIndex)
                        : ''
                    }
                  />
                ) : (
                  <AddProposalCard
                    toolCallId={proposal.toolCallId}
                    toolType={toolName as 'propose_insert' | 'propose_replace'}
                    input={
                      proposal.input as
                        | { insertAfter?: number; newMarkdown: string; reason: string }
                        | undefined
                    }
                    output={proposal.output as string | undefined}
                    state={proposal.state}
                    onApplyInsert={handleApplyInsert}
                    onApplyReplace={handleApplyReplace}
                    onDiscard={(id, tn) => handleDiscard(id, tn)}
                  />
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="-left-3 h-7 w-7" />
        <CarouselNext className="-right-3 h-7 w-7" />
      </Carousel>
    </div>
  );
}
