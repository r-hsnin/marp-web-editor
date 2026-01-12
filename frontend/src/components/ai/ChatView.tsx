import { getToolName, isToolUIPart, type ToolUIPart, type UIMessage } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { History, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMarpChat } from '../../hooks/useMarpChat';
import { useChatStore } from '../../lib/chatStore';
import { PanelSwitcher } from '../editor/PanelSwitcher';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { InteractiveComponent } from './InteractiveComponent';
import { PlanCard } from './PlanCard';
import { ProposalCarousel } from './ProposalCarousel';
import { ReviewCard } from './ReviewCard';

function ChatHistory({ onClose }: { onClose: () => void }) {
  const { sessions, activeSessionId, switchSession, deleteSession, createSession } = useChatStore();

  const handleNewChat = () => {
    createSession();
    onClose();
  };

  const handleSelect = (id: string) => {
    switchSession(id);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <Button onClick={handleNewChat} className="mb-4 w-full" variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        New Chat
      </Button>
      <div className="flex-1 overflow-y-auto space-y-2">
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No chat history</p>
        )}
        {sessions.map((session) => (
          <button
            type="button"
            key={session.id}
            className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group w-full text-left ${
              session.id === activeSessionId ? 'bg-primary/10' : 'hover:bg-muted'
            }`}
            onClick={() => handleSelect(session.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.title}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(session.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatContent() {
  const {
    messages,
    sendMessage,
    isStreaming,
    isThinking,
    agentIntents,
    handleApplyProposal,
    handleApplyInsertProposal,
    handleApplyReplaceProposal,
    handleApplyAllProposals,
    handleDiscardProposal,
    clearHistory,
    getSlideContent,
  } = useMarpChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { createSession, activeSessionId } = useChatStore();

  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus();
    }
  }, [isStreaming]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create session if none exists
    if (!activeSessionId) {
      createSession();
    }

    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="h-10 px-3 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center gap-2">
        <span className="hidden md:inline text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
          AI
        </span>
        <div className="flex-1" />
        <PanelSwitcher />
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-muted-foreground hover:text-foreground"
              title="Chat history"
            >
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader className="pr-10">
              <SheetTitle>Chat History</SheetTitle>
            </SheetHeader>
            <div className="mt-4 h-[calc(100%-4rem)]">
              <ChatHistory onClose={() => setHistoryOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-10">
            How can I help you with your presentation today?
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m: UIMessage) => {
            const parts = m.parts ?? [];
            const hasTextContent = parts.some((part) => part.type === 'text' && part.text);
            const hasToolContent = parts.some((part) => isToolUIPart(part));
            if (!hasTextContent && !hasToolContent && m.role === 'assistant') {
              return null;
            }

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
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
                  {(() => {
                    const textParts = parts.filter((p) => p.type === 'text');
                    const toolParts = parts.filter((p) => isToolUIPart(p)) as ToolUIPart[];
                    const proposalTools = toolParts.filter((p) => {
                      const name = getToolName(p);
                      return (
                        name === 'propose_edit' ||
                        name === 'propose_insert' ||
                        name === 'propose_replace'
                      );
                    });
                    const otherTools = toolParts.filter((p) => {
                      const name = getToolName(p);
                      return (
                        name !== 'propose_edit' &&
                        name !== 'propose_insert' &&
                        name !== 'propose_replace'
                      );
                    });

                    return (
                      <>
                        {textParts.map((part) => (
                          <div
                            key={`text-${part.type === 'text' ? part.text.slice(0, 20) : ''}`}
                            className="prose prose-sm max-w-none [--tw-prose-body:inherit] [--tw-prose-headings:inherit] [--tw-prose-bold:inherit] [--tw-prose-code:inherit]"
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {part.type === 'text' ? part.text : ''}
                            </ReactMarkdown>
                          </div>
                        ))}

                        {proposalTools.length > 0 && (
                          <ProposalCarousel
                            proposals={proposalTools}
                            onApplyEdit={handleApplyProposal}
                            onApplyInsert={handleApplyInsertProposal}
                            onApplyReplace={handleApplyReplaceProposal}
                            onApplyAll={handleApplyAllProposals}
                            onDiscard={handleDiscardProposal}
                            getSlideContent={getSlideContent}
                          />
                        )}

                        {otherTools.map((part) => {
                          const toolName = getToolName(part);
                          return (
                            <div key={part.toolCallId} className="mt-2 w-full">
                              {toolName === 'propose_plan' && part.input ? (
                                <PlanCard
                                  input={
                                    part.input as {
                                      title: string;
                                      outline: Array<{ title: string; description?: string }>;
                                      rationale?: string;
                                    }
                                  }
                                />
                              ) : toolName === 'propose_review' && part.input ? (
                                <ReviewCard
                                  input={
                                    part.input as {
                                      score: number;
                                      overview: string;
                                      good: string[];
                                      improvements: Array<{
                                        slideIndex: number;
                                        title: string;
                                        problem: string;
                                        suggestion: string;
                                      }>;
                                    }
                                  }
                                />
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
                        })}
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2"
          >
            <div className="bg-muted p-3 rounded-lg text-sm flex items-center gap-1">
              <span>Thinking</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1 h-1 bg-current rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border flex gap-2">
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowClearConfirm(true)}
            title="Clear chat history"
            className="text-muted-foreground hover:text-destructive"
            disabled={isStreaming}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={isStreaming}
        />
        <Button type="submit" size="icon" disabled={isStreaming}>
          <Send className="w-4 h-4" />
        </Button>
      </form>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
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

export function ChatView() {
  const { activeSessionId } = useChatStore();

  // key でセッション切り替え時に再マウント
  return <ChatContent key={activeSessionId ?? 'no-session'} />;
}
