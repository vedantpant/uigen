import { Loader2 } from "lucide-react";
import { TOOL_LABELS, DEFAULT_TOOL_LABEL } from "@/lib/tool-labels";

interface ToolInvocationBadgeProps {
  toolName: string;
  isDone: boolean;
}

export function ToolInvocationBadge({ toolName, isDone }: ToolInvocationBadgeProps) {
  const label = TOOL_LABELS[toolName] ?? DEFAULT_TOOL_LABEL;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label.done}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label.pending}</span>
        </>
      )}
    </div>
  );
}
