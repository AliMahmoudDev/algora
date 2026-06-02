'use client';

import { useRef } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';

// Language mapping for Monaco
const languageMap: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  cpp: 'cpp',
  java: 'java',
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = '100%',
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleChange: OnChange = (valueOrUndefined) => {
    onChange(valueOrUndefined ?? '');
  };

  return (
    <Editor
      height={height}
      language={languageMap[language] || 'python'}
      value={value}
      onChange={handleChange}
      onMount={handleMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        bracketPairColorization: { enabled: true },
        padding: { top: 16 },
        readOnly,
        contextmenu: true,
        copyWithSyntaxHighlighting: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        wordBasedSuggestions: 'currentDocument',
        parameterHints: { enabled: true },
      }}
      loading={
        <div className="flex items-center justify-center h-full bg-[#161622]">
          <div className="text-algora-text-dim text-sm">Loading editor...</div>
        </div>
      }
    />
  );
}
