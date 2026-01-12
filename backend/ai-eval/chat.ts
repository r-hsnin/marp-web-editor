/**
 * 対話型テストスクリプト
 * 会話履歴をJSONに保存しながらAIと対話
 */

import { readFileSync, writeFileSync } from 'node:fs';

const API_URL = 'http://localhost:3001/api/ai/chat';
const CONVERSATION_FILE = './ai-eval/conversation.json';

type UIMessage = {
  id: string;
  role: string;
  parts: Array<{ type: string; text?: string; toolInvocation?: unknown }>;
  createdAt: string;
};

type Conversation = {
  context: string;
  theme?: string;
  messages: UIMessage[];
};

const defaultConversation: Conversation = {
  context: '# タイトル\n\n内容を入力してください',
  messages: [],
};

function loadConversation(): Conversation {
  try {
    const data = readFileSync(CONVERSATION_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultConversation;
  }
}

function saveConversation(conv: Conversation): void {
  writeFileSync(CONVERSATION_FILE, JSON.stringify(conv, null, 2));
}

function createUserMessage(text: string): UIMessage {
  return {
    id: crypto.randomUUID(),
    role: 'user',
    parts: [{ type: 'text', text }],
    createdAt: new Date().toISOString(),
  };
}

function createAssistantMessage(text: string, toolInvocation?: unknown): UIMessage {
  const parts: UIMessage['parts'] = [];
  if (text) {
    parts.push({ type: 'text', text });
  }
  if (toolInvocation) {
    parts.push({ type: 'tool-invocation', toolInvocation });
  }
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    parts,
    createdAt: new Date().toISOString(),
  };
}

let autoApply = false;

async function sendMessage(userText: string): Promise<void> {
  const conv = loadConversation();

  // ユーザーメッセージを追加
  const userMsg = createUserMessage(userText);
  conv.messages.push(userMsg);

  console.log(`\n👤 User: ${userText}\n`);
  console.log('🤖 Assistant: ');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conv.messages,
        context: conv.context,
        theme: conv.theme,
      }),
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status}`);
      return;
    }

    // エージェント情報を表示
    const agentIntent = response.headers.get('X-Agent-Intent');
    if (agentIntent) {
      console.log(`🎯 Agent: ${agentIntent}\n`);
    }

    const text = await response.text();
    const lines = text.split('\n').filter((l) => l.startsWith('data: '));

    let assistantText = '';
    let toolName: string | undefined;
    let toolInput: unknown;

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'text-delta' && parsed.delta) {
          process.stdout.write(parsed.delta);
          assistantText += parsed.delta;
        } else if (parsed.type === 'tool-input-available') {
          toolName = parsed.toolName;
          toolInput = parsed.input;
          console.log(`\n\n📦 Tool: ${toolName}`);
          console.log(JSON.stringify(toolInput, null, 2));
        }
      } catch {
        // ignore
      }
    }

    console.log('\n');

    // アシスタントメッセージを保存
    const assistantMsg = createAssistantMessage(
      assistantText,
      toolName ? { toolName, state: 'result', result: JSON.stringify(toolInput) } : undefined,
    );
    conv.messages.push(assistantMsg);

    // auto-apply: ツール結果を context に適用
    if (autoApply && toolName && toolInput) {
      const slides = conv.context.split(/\n---\n/);
      const input = toolInput as {
        slideIndex?: number;
        insertAfter?: number;
        newMarkdown?: string;
      };

      if (toolName === 'propose_replace' && input.newMarkdown) {
        conv.context = input.newMarkdown;
        console.log('🔄 Auto-applied propose_replace');
      } else if (
        toolName === 'propose_edit' &&
        input.slideIndex !== undefined &&
        input.newMarkdown
      ) {
        slides[input.slideIndex] = input.newMarkdown;
        conv.context = slides.join('\n\n---\n\n');
        console.log(`🔄 Auto-applied propose_edit (slide ${input.slideIndex})`);
      } else if (
        toolName === 'propose_insert' &&
        input.insertAfter !== undefined &&
        input.newMarkdown
      ) {
        slides.splice(input.insertAfter + 1, 0, input.newMarkdown);
        conv.context = slides.join('\n\n---\n\n');
        console.log(`🔄 Auto-applied propose_insert (after slide ${input.insertAfter})`);
      }
    }

    saveConversation(conv);
    console.log(`💾 会話履歴を保存しました (${conv.messages.length} メッセージ)`);
  } catch (e) {
    console.error('Error:', e);
  }
}

// コマンドライン引数の解析
const args = process.argv.slice(2);
if (args.includes('--auto-apply')) {
  autoApply = true;
  args.splice(args.indexOf('--auto-apply'), 1);
}
const userInput = args.join(' ');

if (!userInput) {
  console.log('Usage: bun run scripts/chat.ts [--auto-apply] <message>');
  console.log('Example: bun run scripts/chat.ts 構成案を考えて');
  console.log('\nOptions:');
  console.log('  --auto-apply        propose_* を自動で context に適用');
  console.log('\nCommands:');
  console.log('  --reset [theme]     会話をリセット');
  console.log('  --show              会話履歴を表示');
  console.log('  --context <md>      context を更新');
  console.log('  --apply             最後の propose_replace を context に適用');
  process.exit(1);
}

if (userInput === '--reset' || userInput.startsWith('--reset ')) {
  const theme = process.argv[3] || undefined;
  saveConversation({
    context: '# タイトル\n\n内容を入力してください',
    theme,
    messages: [],
  });
  console.log(`会話をリセットしました${theme ? ` (theme: ${theme})` : ' (テーマなし)'}`);
  process.exit(0);
}

if (userInput === '--apply') {
  const conv = loadConversation();
  // 最後の propose_replace を探す
  for (let i = conv.messages.length - 1; i >= 0; i--) {
    const msg = conv.messages[i];
    if (msg.role !== 'assistant') continue;
    const toolPart = msg.parts.find((p) => p.type === 'tool-invocation');
    if (!toolPart?.toolInvocation) continue;
    const inv = toolPart.toolInvocation as { toolName: string; result?: string };
    if (inv.toolName === 'propose_replace' && inv.result) {
      const parsed = JSON.parse(inv.result);
      conv.context = parsed.newMarkdown;
      saveConversation(conv);
      console.log('✅ propose_replace を context に適用しました');
      console.log(`\n${conv.context.slice(0, 200)}...`);
      process.exit(0);
    }
  }
  console.log('❌ propose_replace が見つかりません');
  process.exit(1);
}

if (userInput.startsWith('--context ')) {
  const newContext = process.argv.slice(3).join(' ');
  const conv = loadConversation();
  conv.context = newContext;
  saveConversation(conv);
  console.log('✅ context を更新しました');
  console.log(`\n${conv.context.slice(0, 200)}...`);
  process.exit(0);
}

if (userInput === '--show') {
  const conv = loadConversation();
  console.log('=== 会話履歴 ===\n');
  console.log(`📄 Context (${conv.context.length} chars):`);
  console.log(conv.context.slice(0, 300) + (conv.context.length > 300 ? '...' : ''));
  console.log(`\n🎨 Theme: ${conv.theme || '(なし)'}\n`);
  for (const msg of conv.messages) {
    const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
    const text = msg.parts.find((p) => p.type === 'text')?.text || '';
    const tool = msg.parts.find((p) => p.type === 'tool-invocation');
    console.log(`${role}: ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`);
    if (tool) {
      console.log(`   📦 Tool: ${(tool.toolInvocation as { toolName: string }).toolName}`);
    }
    console.log();
  }
  process.exit(0);
}

sendMessage(userInput);
