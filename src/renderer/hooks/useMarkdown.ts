import { useCallback, useState } from 'react';
import MarkdownIt from 'markdown-it';
import markdownItTaskLists from 'markdown-it-task-lists';
import DOMPurify from 'dompurify';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: false
});

md.enable(['table', 'strikethrough']);
md.use(markdownItTaskLists, {
  enabled: false,
  label: true,
  labelAfter: true
});

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export function renderMarkdown(markdown: string): string {
  const rawHtml = md.render(markdown);

  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'strong',
      'em',
      'u',
      's',
      'code',
      'pre',
      'a',
      'img',
      'ul',
      'ol',
      'li',
      'blockquote',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'input',
      'label',
      'sup',
      'sub',
      'div',
      'span'
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'class',
      'id',
      'type',
      'checked',
      'disabled',
      'align',
      'colspan',
      'rowspan',
      'rel'
    ]
  });
}

export function useMarkdown(initialContent = '') {
  const [content, setContent] = useState(initialContent);
  const [html, setHtml] = useState(() => renderMarkdown(initialContent));

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    setHtml(renderMarkdown(newContent));
  }, []);

  return {
    content,
    html,
    updateContent
  };
}
