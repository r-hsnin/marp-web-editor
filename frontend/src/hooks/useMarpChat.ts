import { type UIMessage, useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useThemeStore } from '../lib/marp/themeStore';
import { useEditorStore } from '../lib/store';

const CHAT_STORAGE_KEY = 'marp-chat-history';
const INTENTS_STORAGE_KEY = 'marp-chat-intents';

function loadMessagesFromStorage(): UIMessage[] {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadIntentsFromStorage(): Record<string, string> {
  try {
    const stored = localStorage.getItem(INTENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function formatContextWithIndices(markdown: string): string {
  const slides = markdown.split(/\n---\n/);
  return slides.map((slide, i) => `[${i}]\n${slide.trim()}`).join('\n\n---\n\n');
}

export function useMarpChat() {
  const { markdown, setMarkdown } = useEditorStore();
  const { activeThemeId } = useThemeStore();
  const [input, setInput] = useState('');
  const [agentIntents, setAgentIntents] = useState<Record<string, string>>(loadIntentsFromStorage);
  const currentIntentRef = useRef<string | null>(null);
  const markdownRef = useRef(markdown);
  const themeRef = useRef(activeThemeId);
  const initialMessages = useMemo(() => loadMessagesFromStorage(), []);

  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  useEffect(() => {
    themeRef.current = activeThemeId;
  }, [activeThemeId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
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
    messages: initialMessages,
    transport,
    // @ts-ignore: Correcting signature based on lint error
    // biome-ignore lint/suspicious/noExplicitAny: Handling varied API response signatures
    onFinish: (result: any) => {
      const message = result.message || result;
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
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Error: ${error.message || 'Connection failed'}`,
          parts: [],
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

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (Object.keys(agentIntents).length > 0) {
      localStorage.setItem(INTENTS_STORAGE_KEY, JSON.stringify(agentIntents));
    }
  }, [agentIntents]);

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
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  const sendMessage = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) e.preventDefault();
      if (!input.trim()) return;

      const userMessage = input;
      setInput('');
      currentIntentRef.current = null;

      if (sendChatRequest) {
        await sendChatRequest({
          role: 'user',
          parts: [{ type: 'text', text: userMessage }],
        });
      }
    },
    [sendChatRequest, input],
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
      const newSlides = newMarkdown.trim().split(/\n---\n/);
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
      setMarkdown(newMarkdown.trim());

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
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(INTENTS_STORAGE_KEY);
  }, [setMessages]);

  const getSlideContent = useCallback(
    (slideIndex: number): string => {
      const slides = markdown.split(/\n---\n/);
      return slides[slideIndex]?.trim() ?? '';
    },
    [markdown],
  );

  return {
    messages,
    input,
    handleInputChange,
    sendMessage,
    isLoading,
    stop,
    agentIntents,
    handleApplyProposal,
    handleApplyInsertProposal,
    handleApplyReplaceProposal,
    handleDiscardProposal,
    clearHistory,
    getSlideContent,
  };
}
