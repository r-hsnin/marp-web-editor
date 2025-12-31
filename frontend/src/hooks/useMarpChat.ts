import type { UIMessage } from '@ai-sdk/react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChatStore } from '../lib/chatStore';
import { API_BASE } from '../lib/config';
import { useThemeStore } from '../lib/marp/themeStore';
import { useEditorStore } from '../lib/store';

function formatContextWithIndices(markdown: string): string {
  const slides = markdown.split(/\n---\n/);
  return slides.map((slide, i) => `[${i}]\n${slide.trim()}`).join('\n\n---\n\n');
}

export function useMarpChat() {
  const { markdown, setMarkdown } = useEditorStore();
  const { activeThemeId } = useThemeStore();
  const { getActiveSession, updateSession, activeSessionId } = useChatStore();

  const [agentIntents, setAgentIntents] = useState<Record<string, string>>({});
  const currentIntentRef = useRef<string | null>(null);
  const markdownRef = useRef(markdown);
  const themeRef = useRef(activeThemeId);

  const activeSession = getActiveSession();
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only re-compute when session ID changes
  const initialMessages = useMemo(() => activeSession?.messages ?? [], [activeSession?.id]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only re-compute when session ID changes
  const initialIntents = useMemo(() => activeSession?.intents ?? {}, [activeSession?.id]);

  // Initialize intents from session
  useEffect(() => {
    setAgentIntents(initialIntents);
  }, [initialIntents]);

  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  useEffect(() => {
    themeRef.current = activeThemeId;
  }, [activeThemeId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_BASE}/api/ai/chat`,
        prepareSendMessagesRequest({ messages }) {
          return {
            body: {
              messages,
              context: formatContextWithIndices(markdownRef.current),
              theme: themeRef.current,
            },
          };
        },
        fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
          const response = await fetch(input, init);
          const intent = response.headers.get('X-Agent-Intent');
          if (intent) {
            currentIntentRef.current = intent;
          }
          return response;
        }) as unknown as typeof fetch,
      }),
    [],
  );

  const {
    messages,
    status,
    stop,
    sendMessage: sendChatRequest,
    setMessages,
    addToolOutput,
  } = useChat({
    id: activeSessionId ?? undefined,
    messages: initialMessages,
    transport,
    onFinish: (result: { message?: UIMessage } | UIMessage) => {
      const message = ('message' in result ? result.message : result) as UIMessage;
      const intent = currentIntentRef.current;
      if (message.role === 'assistant' && intent) {
        setAgentIntents((prev) => ({
          ...prev,
          [message.id]: intent,
        }));
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      let displayMessage = 'Connection failed. Please try again.';
      const msg = error.message || '';
      if (msg.includes('API key')) {
        displayMessage = 'API key is invalid or missing. Please check your configuration.';
      } else if (msg.includes('rate limit')) {
        displayMessage = 'Rate limit exceeded. Please wait a moment.';
      } else if (msg.includes('network') || msg.includes('fetch')) {
        displayMessage = 'Network error. Please check your connection.';
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          parts: [{ type: 'text', text: `⚠️ ${displayMessage}` }],
        },
      ]);
    },
  });

  const lastMessage = messages[messages.length - 1];
  const lastMessageIsAssistant = lastMessage?.role === 'assistant';
  const lastMessageHasContent =
    lastMessageIsAssistant &&
    lastMessage?.parts.some((p) => p.type === 'text' && p.text.length > 0);

  const isLoading = status === 'submitted' || (status === 'streaming' && !lastMessageHasContent);

  // Sync messages to chatStore
  useEffect(() => {
    if (activeSessionId && messages.length > 0) {
      updateSession(activeSessionId, messages, agentIntents);
    }
  }, [messages, agentIntents, activeSessionId, updateSession]);

  // Sync intent on streaming
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const intent = currentIntentRef.current;
    if (lastMessage?.role === 'assistant' && intent) {
      setAgentIntents((prev) => {
        if (prev[lastMessage.id] === intent) return prev;
        return { ...prev, [lastMessage.id]: intent };
      });
    }
  }, [messages]);

  const handleInputChange = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // This is now handled in ChatView directly
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      currentIntentRef.current = null;

      if (sendChatRequest) {
        await sendChatRequest({
          role: 'user',
          parts: [{ type: 'text', text }],
        });
      }
    },
    [sendChatRequest],
  );

  const handleApplyProposal = useCallback(
    (toolCallId: string, _result: unknown, slideIndex: number, newMarkdown: string) => {
      const slides = markdown.split(/\n---\n/);
      if (slides[slideIndex] !== undefined) {
        const isFirst = slideIndex === 0;
        const isLast = slideIndex === slides.length - 1;
        const prefix = isFirst ? '' : '\n';
        const suffix = isLast ? '' : '\n';
        slides[slideIndex] = `${prefix}${newMarkdown.trim()}${suffix}`;
        setMarkdown(slides.join('\n---\n'));
      }

      addToolOutput({
        tool: 'propose_edit',
        toolCallId,
        output: 'Applied successfully',
      });
    },
    [markdown, setMarkdown, addToolOutput],
  );

  const handleApplyInsertProposal = useCallback(
    (toolCallId: string, insertAfter: number, newMarkdown: string) => {
      const existingSlides = markdown.split(/\n---\n/);
      const cleanedMarkdown = newMarkdown.trim().replace(/^---\n/, '');
      const newSlides = cleanedMarkdown.split(/\n---\n/);
      const insertIndex = insertAfter + 1;

      const formattedNewSlides = newSlides.map((s, i) => {
        const isFirst = insertIndex === 0 && i === 0;
        const prefix = isFirst ? '' : '\n';
        return `${prefix}${s.trim()}\n`;
      });

      existingSlides.splice(insertIndex, 0, ...formattedNewSlides);
      setMarkdown(existingSlides.join('\n---\n'));

      addToolOutput({
        tool: 'propose_insert',
        toolCallId,
        output: 'Slides added successfully',
      });
    },
    [markdown, setMarkdown, addToolOutput],
  );

  const handleApplyReplaceProposal = useCallback(
    (toolCallId: string, newMarkdown: string) => {
      const cleaned = newMarkdown.trim().replace(/^---\n/, '');
      setMarkdown(cleaned);

      addToolOutput({
        tool: 'propose_replace',
        toolCallId,
        output: 'All slides replaced successfully',
      });
    },
    [setMarkdown, addToolOutput],
  );

  const handleDiscardProposal = useCallback(
    (
      toolCallId: string,
      toolName: 'propose_edit' | 'propose_insert' | 'propose_replace' = 'propose_edit',
    ) => {
      addToolOutput({
        tool: toolName,
        toolCallId,
        output: 'User discarded the proposal',
      });
    },
    [addToolOutput],
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    setAgentIntents({});
    if (activeSessionId) {
      updateSession(activeSessionId, [], {});
    }
  }, [setMessages, activeSessionId, updateSession]);

  const getSlideContent = useCallback(
    (slideIndex: number): string => {
      const slides = markdown.split(/\n---\n/);
      return slides[slideIndex]?.trim() ?? '';
    },
    [markdown],
  );

  const handleApplyAllProposals = useCallback(
    (
      proposals: Array<{
        toolCallId: string;
        toolName: 'propose_edit' | 'propose_insert' | 'propose_replace';
        input: { slideIndex?: number; insertAfter?: number; newMarkdown: string };
      }>,
    ) => {
      let slides = markdown.split(/\n---\n/);

      const edits = proposals.filter((p) => p.toolName === 'propose_edit');
      const inserts = proposals.filter((p) => p.toolName === 'propose_insert');
      const replaces = proposals.filter((p) => p.toolName === 'propose_replace');

      for (const p of edits) {
        const slideIndex = p.input.slideIndex ?? 0;
        if (slides[slideIndex] !== undefined) {
          const isFirst = slideIndex === 0;
          const isLast = slideIndex === slides.length - 1;
          const prefix = isFirst ? '' : '\n';
          const suffix = isLast ? '' : '\n';
          slides[slideIndex] = `${prefix}${p.input.newMarkdown.trim()}${suffix}`;
        }
        addToolOutput({
          tool: 'propose_edit',
          toolCallId: p.toolCallId,
          output: 'Applied successfully',
        });
      }

      inserts.sort((a, b) => (b.input.insertAfter ?? -1) - (a.input.insertAfter ?? -1));
      for (const p of inserts) {
        const insertAfter = p.input.insertAfter ?? -1;
        const cleanedMarkdown = p.input.newMarkdown.trim().replace(/^---\n/, '');
        const newSlides = cleanedMarkdown.split(/\n---\n/);
        const insertIndex = insertAfter + 1;
        const formattedNewSlides = newSlides.map((s, i) => {
          const isFirst = insertIndex === 0 && i === 0;
          const prefix = isFirst ? '' : '\n';
          return `${prefix}${s.trim()}\n`;
        });
        slides.splice(insertIndex, 0, ...formattedNewSlides);
        addToolOutput({
          tool: 'propose_insert',
          toolCallId: p.toolCallId,
          output: 'Slides added successfully',
        });
      }

      for (const p of replaces) {
        const cleaned = p.input.newMarkdown.trim().replace(/^---\n/, '');
        slides = cleaned.split(/\n---\n/);
        addToolOutput({
          tool: 'propose_replace',
          toolCallId: p.toolCallId,
          output: 'All slides replaced successfully',
        });
      }

      setMarkdown(slides.join('\n---\n'));
    },
    [markdown, setMarkdown, addToolOutput],
  );

  return {
    messages,
    handleInputChange,
    sendMessage,
    isLoading,
    stop,
    agentIntents,
    handleApplyProposal,
    handleApplyInsertProposal,
    handleApplyReplaceProposal,
    handleApplyAllProposals,
    handleDiscardProposal,
    clearHistory,
    getSlideContent,
  };
}
