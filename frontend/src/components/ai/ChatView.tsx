import type { UIMessage } from 'ai';
import { Bot, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useMarpChat } from '../../hooks/useMarpChat';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { InteractiveComponent } from './InteractiveComponent';

export function ChatView() {
  const {
    messages,
    input,
    handleInputChange,
    sendMessage,
    isLoading,
    interactiveUI,
    agentIntents,
  } = useMarpChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Bot className="w-5 h-5" />
        <h2 className="font-semibold">Marp AI</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-10">
            How can I help you with your presentation today?
          </div>
        )}
        {messages.map((m: UIMessage) => {
          // Skip empty assistant messages during streaming
          const hasContent = m.parts.some((part) => part.type === 'text' && part.text);
          if (!hasContent && m.role === 'assistant') {
            return null;
          }

          return (
            <div
              key={m.id}
              className={`flex flex-col gap-1 ${
                // Note: role is still accessible on UIMessage, though type might be 'user' | 'assistant' | 'system'
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
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
                {m.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      // biome-ignore lint/suspicious/noArrayIndexKey: Parts order is stable
                      <div key={index} className="whitespace-pre-wrap">
                        {part.text}
                      </div>
                    );
                  }
                  if (part.type === 'tool-invocation') {
                    // biome-ignore lint/suspicious/noExplicitAny: ToolInvocation access
                    const toolInvocation = (part as any).toolInvocation;
                    return (
                      <div key={toolInvocation.toolCallId} className="mt-2">
                        <div className="text-xs opacity-70 mb-1">
                          Tool: {toolInvocation.toolName}
                        </div>
                        {'result' in toolInvocation ? (
                          <InteractiveComponent
                            toolName={toolInvocation.toolName}
                            data={toolInvocation.result}
                          />
                        ) : (
                          <div className="animate-pulse text-xs">Running...</div>
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

        {/* Render Interactive UI for the latest response if applicable */}
        {interactiveUI && !isLoading && messages[messages.length - 1]?.role === 'assistant' && (
          <div className="flex flex-col gap-1 items-start">
            <div className="p-3 rounded-lg max-w-[85%] text-sm bg-muted text-foreground w-full">
              <div className="text-xs opacity-70 mb-1">Generated Plan</div>
              <InteractiveComponent data={interactiveUI.data} toolName={interactiveUI.toolName} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-border flex gap-2">
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
    </div>
  );
}
