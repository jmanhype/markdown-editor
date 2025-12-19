import React, { useEffect, useMemo, useRef } from 'react';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { Compartment, EditorState, Prec } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { highlightSelectionMatches, openSearchPanel, search, searchKeymap } from '@codemirror/search';
import { emacs } from '@replit/codemirror-emacs';
import { vim } from '@replit/codemirror-vim';
import { KeybindingMode } from '../hooks/useKeybindingMode';
import '../styles/editor.css';

interface CursorPosition {
  line: number;
  column: number;
}

interface EditorProps {
  content: string;
  onChange?: (content: string) => void;
  onCursorChange?: (position: CursorPosition) => void;
  onRequestSave?: () => void;
  onRequestOpen?: () => void;
  keybindingMode: KeybindingMode;
  theme: 'light' | 'dark';
}

function focusReplaceField(view: EditorView) {
  requestAnimationFrame(() => {
    const replaceInput = view.dom.querySelector('.cm-search input[name=replace]') as HTMLInputElement | null;
    replaceInput?.focus();
    replaceInput?.select();
  });
}

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  onCursorChange,
  onRequestSave,
  onRequestOpen,
  keybindingMode,
  theme
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const themeCompartment = useRef(new Compartment()).current;
  const keybindingCompartment = useRef(new Compartment()).current;

  const callbacksRef = useRef({ onChange, onCursorChange, onRequestSave, onRequestOpen });
  callbacksRef.current = { onChange, onCursorChange, onRequestSave, onRequestOpen };

  const suppressOnChangeRef = useRef(false);

  const baseExtensions = useMemo(() => {
    return [
      Prec.high(
        keymap.of([
          {
            key: 'Mod-o',
            run: () => {
              callbacksRef.current.onRequestOpen?.();
              return true;
            }
          },
          {
            key: 'Mod-s',
            run: () => {
              callbacksRef.current.onRequestSave?.();
              return true;
            }
          },
          {
            key: 'Mod-f',
            run: (view) => {
              openSearchPanel(view);
              return true;
            }
          },
          {
            key: 'Mod-h',
            run: (view) => {
              openSearchPanel(view);
              focusReplaceField(view);
              return true;
            }
          }
        ])
      ),
      keybindingCompartment.of([]),
      history(),
      search({ top: false }),
      highlightSelectionMatches(),
      keymap.of([...searchKeymap, ...defaultKeymap, ...historyKeymap]),
      markdown({ base: markdownLanguage }),
      syntaxHighlighting(defaultHighlightStyle),
      placeholder('Start writing...'),
      EditorView.lineWrapping,
      themeCompartment.of([]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && callbacksRef.current.onChange && !suppressOnChangeRef.current) {
          callbacksRef.current.onChange(update.state.doc.toString());
        }

        if (update.selectionSet && callbacksRef.current.onCursorChange) {
          const head = update.state.selection.main.head;
          const line = update.state.doc.lineAt(head);
          callbacksRef.current.onCursorChange({
            line: line.number,
            column: head - line.from + 1
          });
        }
      })
    ];
  }, [keybindingCompartment, themeCompartment]);

  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: baseExtensions
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [baseExtensions, content]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const themeExtension = theme === 'dark' ? oneDark : [];
    view.dispatch({
      effects: themeCompartment.reconfigure(themeExtension)
    });
  }, [theme, themeCompartment]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const extension = keybindingMode === 'vim' ? vim() : keybindingMode === 'emacs' ? emacs() : [];
    view.dispatch({
      effects: keybindingCompartment.reconfigure(extension)
    });
  }, [keybindingCompartment, keybindingMode]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const current = view.state.doc.toString();
    if (content === current) return;

    suppressOnChangeRef.current = true;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content }
    });
    suppressOnChangeRef.current = false;
  }, [content]);

  return (
    <div className="editor-container">
      <div ref={editorRef} />
    </div>
  );
};
