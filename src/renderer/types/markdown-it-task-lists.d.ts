declare module 'markdown-it-task-lists' {
  import type { PluginSimple } from 'markdown-it';

  export interface MarkdownItTaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
  }

  const plugin: PluginSimple | ((md: unknown, options?: MarkdownItTaskListsOptions) => void);
  export default plugin;
}
