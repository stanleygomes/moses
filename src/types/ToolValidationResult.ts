export type ToolValidationResult =
  | { installed: true; path: string }
  | { installed: false; installCmd?: string; installUrl: string };
