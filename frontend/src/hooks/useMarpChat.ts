import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../lib/store';

export function useMarpChat() {
  const { markdown } = useEditorStore();
  const [input, setInput] = useState('');
  const [interactiveUI, setInteractiveUI] = useState<{
    data: unknown;
    toolName: string;
  } | null>(null);
  const [agentIntents, setAgentIntents] = useState<Record<string, string>>({});
  const currentIntentRef = useRef<string | null>(null);

  const {
    messages,
    status,
    stop,
    sendMessage: sendChatRequest,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      body: {
        context: markdown,
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

    if (lastMessage?.role === 'assistant' && !isLoading) {
      // Extract text from parts array
      const textContent = lastMessage.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('');

      if (textContent.trim().startsWith('{')) {
        try {
          const data = JSON.parse(textContent);
          if (data.plan && Array.isArray(data.plan)) {
            setInteractiveUI({ data, toolName: 'displayPlan' });
          }
        } catch (e) {
          // Ignore JSON parse errors while streaming
        }
      }
    } else if (lastMessage?.role === 'user') {
      if (interactiveUI) setInteractiveUI(null);
    }
  }, [messages, isLoading, interactiveUI]);

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

  return {
    messages,
    input,
    handleInputChange,
    sendMessage,
    isLoading,
    stop,
    interactiveUI,
    agentIntents,
  };
}
