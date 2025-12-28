import { getToolName, isToolUIPart, type UIMessage } from 'ai';
import { Bot, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMarpChat } from '../../hooks/useMarpChat';
import { useThemeStore } from '../../lib/marp/themeStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AddProposalCard } from './AddProposalCard';
import { InteractiveComponent } from './InteractiveComponent';
import { ProposalCard } from './ProposalCard';

export function ChatView() {
  const {
    messages,
    input,
    handleInputChange,
    sendMessage,
    isLoading,
    agentIntents,
    handleApplyProposal,
    handleApplyInsertProposal,
    handleApplyReplaceProposal,
    handleDiscardProposal,
    clearHistory,
    getSlideContent,
  } = useMarpChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { activeThemeId } = useThemeStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Bot className="w-5 h-5" />
        <h2 className="font-semibold">Marp AI</h2>
        <Badge variant="outline" className="text-xs">
          theme: {activeThemeId}
        </Badge>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-10">
            How can I help you with your presentation today?
          </div>
        )}
        {messages.map((m: UIMessage) => {
          const parts = m.parts ?? [];
          const hasTextContent = parts.some((part) => part.type === 'text' && part.text);
          const hasToolContent = parts.some((part) => isToolUIPart(part));
          if (!hasTextContent && !hasToolContent && m.role === 'assistant') {
            return null;
          }

          return (
            <div
              key={m.id}
              className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[85%] text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {m.role === 'assistant' && agentIntents[m.id] && (
                  <div className="mb-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-5 bg-background/50 hover:bg-background/60 border-0"
                    >
                      {agentIntents[m.id].charAt(0).toUpperCase() + agentIntents[m.id].slice(1)}
                    </Badge>
                  </div>
                )}
                {parts.map((part) => {
                  if (part.type === 'text') {
                    return (
                      <div
                        key={`text-${part.text.slice(0, 20)}`}
                        className="prose prose-sm max-w-none [--tw-prose-body:inherit] [--tw-prose-headings:inherit] [--tw-prose-bold:inherit] [--tw-prose-code:inherit]"
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                      </div>
                    );
                  }
                  if (isToolUIPart(part)) {
                    const toolName = getToolName(part);

                    return (
                      <div key={part.toolCallId} className="mt-2 w-full">
                        {toolName === 'propose_edit' ? (
                          <ProposalCard
                            toolCallId={part.toolCallId}
                            input={
                              part.input as
                                | { slideIndex: number; newMarkdown: string; reason: string }
                                | undefined
                            }
                            output={part.output as string | undefined}
                            state={part.state}
                            onApply={handleApplyProposal}
                            onDiscard={handleDiscardProposal}
                            currentContent={
                              (part.input as { slideIndex?: number } | undefined)?.slideIndex !==
                              undefined
                                ? getSlideContent((part.input as { slideIndex: number }).slideIndex)
                                : ''
                            }
                          />
                        ) : toolName === 'propose_insert' || toolName === 'propose_replace' ? (
                          <AddProposalCard
                            toolCallId={part.toolCallId}
                            toolType={toolName}
                            input={
                              part.input as
                                | { insertAfter?: number; newMarkdown: string; reason: string }
                                | undefined
                            }
                            output={part.output as string | undefined}
                            state={part.state}
                            onApplyInsert={handleApplyInsertProposal}
                            onApplyReplace={handleApplyReplaceProposal}
                            onDiscard={handleDiscardProposal}
                          />
                        ) : toolName === 'propose_plan' && part.input ? (
                          <div className="p-3 border rounded-lg bg-muted/50">
                            <div className="font-semibold text-sm mb-2">
                              {(part.input as { title?: string }).title ?? 'Planning...'}
                            </div>
                            <ul className="text-xs space-y-1">
                              {((part.input as { outline?: string[] }).outline ?? []).map(
                                (item, i) => (
                                  // biome-ignore lint/suspicious/noArrayIndexKey: Outline order is stable
                                  <li key={i} className="pl-2 border-l-2 border-primary/50">
                                    {item}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs opacity-70 mb-1">Tool: {toolName}</div>
                            {part.state === 'output-available' ? (
                              <InteractiveComponent toolName={toolName} data={part.output} />
                            ) : (
                              <div className="animate-pulse text-xs">Running...</div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-muted p-3 rounded-lg text-sm animate-pulse">Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-border flex gap-2">
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowClearConfirm(true)}
            title="Clear chat history"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all chat messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
