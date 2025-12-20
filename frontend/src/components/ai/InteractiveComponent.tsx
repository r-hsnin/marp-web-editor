interface InteractiveComponentProps {
  data: unknown;
  toolName?: string;
}

export function InteractiveComponent({ data, toolName }: InteractiveComponentProps) {
  if (!data) return null;

  // Default fallback for debugging or unknown tools
  return (
    <div className="p-2 border rounded bg-muted/50 text-xs">
      <div className="font-bold mb-1">Tool: {toolName || 'Unknown'}</div>
      <pre className="whitespace-pre-wrap overflow-auto max-h-40">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
