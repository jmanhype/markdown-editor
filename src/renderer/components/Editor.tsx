import React, { useEffect, useRef } from 'react';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import '../styles/editor.css';

interface EditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  onRequestSave?: () => void;
  onRequestOpen?: () => void;
  theme: 'light' | 'dark';
}

export const Editor: React.FC<EditorProps> = ({
  initialContent = '',
  onChange,
  onRequestSave,
  onRequestOpen,
  theme
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      Prec.high(
        keymap.of([
          {
            key: 'Mod-o',
            run: () => {
              onRequestOpen?.();
              return true;
            }
          },
          {
            key: 'Mod-s',
            run: () => {
              onRequestSave?.();
              return true;
            }
          }
        ])
      ),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(defaultHighlightStyle),
      placeholder('Start writing...'),
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      })
    ];

    if (theme === 'dark') {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: initialContent,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [onChange, onRequestOpen, onRequestSave, theme]);

  useEffect(() => {
    if (viewRef.current && initialContent !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: initialContent,
        },
      });
    }
  }, [initialContent]);

  return (
    <div className="editor-container">
      <div ref={editorRef} />
    </div>
  );
};
