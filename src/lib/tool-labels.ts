export const TOOL_LABELS: Record<string, { pending: string; done: string }> = {
  str_replace_editor: { pending: "Writing code...", done: "Code updated" },
  file_manager: { pending: "Managing files...", done: "Files updated" },
};

export const DEFAULT_TOOL_LABEL = { pending: "Working...", done: "Done" };
