import { type UIMessage, useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export function useMarpChat() {
  const { markdown, setMarkdown } = useEditorStore();
  const [input, setInput] = useState('');
  const [agentIntents, setAgentIntents] = useState<Record<string, string>>(loadIntentsFromStorage);
  const currentIntentRef = useRef<string | null>(null);
  const markdownRef = useRef(markdown);
  const initialMessages = useMemo(() => loadMessagesFromStorage(), []);

  // Keep ref in sync with latest markdown
  useEffect(() => {
    markdownRef.current = markdown;
  }, [markdown]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        prepareSendMessagesRequest({ messages }) {
          // Send latest markdown content with every request
          return { body: { messages, context: markdownRef.current } };
        },
        // Intercept the response to read the custom header
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
      // Handle both possible signatures (message direct vs object)
      const message = result.message || result;
      const intent = currentIntentRef.current;
      if (message.role === 'assistant' && intent) {
        setAgentIntents((prev) => ({
          ...prev,
          [message.id]: intent,
        }));
        // Do NOT clear currentIntentRef here to prevent race conditions with useEffect
        // It will be cleared on next sendMessage
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
  // isLoading is true if:
  // 1. Status is 'submitted' (waiting for response)
  // 2. Status is 'streaming' BUT no actual text content has arrived yet
  //    (This prevents the "Thinking..." indicator from disappearing too early)
  const lastMessageIsAssistant = lastMessage?.role === 'assistant';
  const lastMessageHasContent =
    lastMessageIsAssistant &&
    lastMessage?.parts.some((p) => p.type === 'text' && p.text.length > 0);

  const isLoading = status === 'submitted' || (status === 'streaming' && !lastMessageHasContent);

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Persist intents to localStorage
  useEffect(() => {
    if (Object.keys(agentIntents).length > 0) {
      localStorage.setItem(INTENTS_STORAGE_KEY, JSON.stringify(agentIntents));
    }
  }, [agentIntents]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Attempt to link current intent to the latest message during streaming
    const intent = currentIntentRef.current;
    if (lastMessage?.role === 'assistant' && intent) {
      setAgentIntents((prev) => {
        // Avoid unnecessary updates
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

      // Clear intent from previous turn
      currentIntentRef.current = null;

      if (sendChatRequest) {
        // sendChatRequest expects a message object based on TS error
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
      // 1. Update the actual slide content
      const slides = markdown.split('---');
      if (slides[slideIndex]) {
        slides[slideIndex] = `\n${newMarkdown}\n`;
        setMarkdown(slides.join('---'));
      }

      // 2. Feedback to AI
      addToolOutput({
        tool: 'propose_edit',
        toolCallId,
        output: 'Applied successfully',
      });
    },
    [markdown, setMarkdown, addToolOutput],
  );

  const handleDiscardProposal = useCallback(
    (toolCallId: string) => {
      addToolOutput({
        tool: 'propose_edit',
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

  return {
    messages,
    input,
    handleInputChange,
    sendMessage,
    isLoading,
    stop,
    agentIntents,
    handleApplyProposal,
    handleDiscardProposal,
    clearHistory,
  };
}
