'use client';

import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillInstanceRef = useRef<unknown>(null);
  const lastExternalValueRef = useRef<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!containerRef.current) return;
    if (quillInstanceRef.current) return;

    const initQuill = async () => {
      const Quill = (await import('quill')).default;
      await import('quill/dist/quill.snow.css');

      if (!containerRef.current) return;
      if (quillInstanceRef.current) return;

      // Create editor div if not exists
      if (!editorRef.current) {
        editorRef.current = document.createElement('div');
        containerRef.current.appendChild(editorRef.current);
      }

      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder ?? 'Write your email...',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            ['link'],
            ['clean'],
          ],
        },
      });

      quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        lastExternalValueRef.current = html;
        onChange(html);
      });

      quillInstanceRef.current = quill;

      if (value) {
        quill.root.innerHTML = value;
        lastExternalValueRef.current = value;
      }
    };

    initQuill();
  }, [isClient, onChange, placeholder, value]);

  useEffect(() => {
    const quill = quillInstanceRef.current as { root: HTMLElement; getSelection: () => unknown; setSelection: (sel: unknown) => void } | null;
    if (!quill) return;

    if (value === lastExternalValueRef.current) return;

    const selection = quill.getSelection();
    quill.root.innerHTML = value || '';
    lastExternalValueRef.current = value || '';
    if (selection) {
      quill.setSelection(selection);
    }
  }, [value]);

  if (!isClient) {
    return (
      <div className="rich-text-editor">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md min-h-[350px] p-4 text-zinc-400">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <div className="bg-white dark:bg-zinc-950" ref={containerRef} />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 300px;
          font-size: 14px;
        }
        .rich-text-editor .ql-editor {
          min-height: 300px;
        }
        .rich-text-editor .ql-toolbar {
          border-color: rgb(228 228 231);
          border-radius: 0.375rem 0.375rem 0 0;
        }
        .rich-text-editor .ql-container {
          border-color: rgb(228 228 231);
          border-radius: 0 0 0.375rem 0.375rem;
        }
        .dark .rich-text-editor .ql-toolbar {
          border-color: rgb(39 39 42);
          background-color: rgb(9 9 11);
        }
        .dark .rich-text-editor .ql-container {
          border-color: rgb(39 39 42);
          background-color: rgb(9 9 11);
        }
        .dark .rich-text-editor .ql-editor {
          color: rgb(250 250 250);
        }
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: rgb(161 161 170);
        }
        .dark .rich-text-editor .ql-stroke {
          stroke: rgb(161 161 170);
        }
        .dark .rich-text-editor .ql-fill {
          fill: rgb(161 161 170);
        }
        .dark .rich-text-editor .ql-picker-label {
          color: rgb(161 161 170);
        }
      `}</style>
    </div>
  );
}
