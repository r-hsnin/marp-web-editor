"use client";

import React, { useState, useEffect } from "react";
import { Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OneshotDialog } from "./OneshotDialog";
import { AgentChatDialog } from "./AgentChatDialog";

interface AIButtonsProps {
  currentMarkdown: string;
  onMarkdownChange: (markdown: string) => void;
  disabled?: boolean;
}

export function AIButtons({
  currentMarkdown,
  onMarkdownChange,
  disabled = false,
}: AIButtonsProps) {
  const [oneshotOpen, setOneshotOpen] = useState(false);
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    fetch("/api/ai/config")
      .then((res) => res.json())
      .then((data) => setAiAvailable(data.available))
      .catch(() => setAiAvailable(false));
  }, []);

  if (!aiAvailable) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* ワンショット修正ボタン */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOneshotOpen(true)}
              disabled={disabled || !currentMarkdown.trim()}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">AI修正</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>AIによるワンショット修正</p>
            <p className="text-xs text-muted-foreground">
              簡単な指示でスライドを自動改善
            </p>
          </TooltipContent>
        </Tooltip>

        {/* エージェント型チャットボタン */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAgentChatOpen(true)}
              disabled={disabled || !currentMarkdown.trim()}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI相談</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>AIエージェントとの対話</p>
            <p className="text-xs text-muted-foreground">
              チャットでスライドを段階的に改善
            </p>
          </TooltipContent>
        </Tooltip>

        {/* ワンショット修正ダイアログ */}
        <OneshotDialog
          open={oneshotOpen}
          onOpenChange={setOneshotOpen}
          currentMarkdown={currentMarkdown}
          onMarkdownChange={onMarkdownChange}
        />

        {/* エージェント型チャットダイアログ */}
        <AgentChatDialog
          open={agentChatOpen}
          onOpenChange={setAgentChatOpen}
          currentMarkdown={currentMarkdown}
          onMarkdownChange={onMarkdownChange}
        />
      </div>
    </TooltipProvider>
  );
}
