'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3, Bold, Italic, List, Heading1, Heading2, Heading3, Code, Quote, Table, Image } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  rows?: number;
  placeholder?: string;
}

const TOOLBAR_BUTTONS = [
  { icon: <Heading1 size={16} />, label: 'H1', insert: '# ' },
  { icon: <Heading2 size={16} />, label: 'H2', insert: '## ' },
  { icon: <Heading3 size={16} />, label: 'H3', insert: '### ' },
  { icon: <Bold size={16} />, label: 'Bold', insert: '**texte**', cursor: -8 },
  { icon: <Italic size={16} />, label: 'Italic', insert: '*texte*', cursor: -7 },
  { icon: <List size={16} />, label: 'List', insert: '- ' },
  { icon: <Quote size={16} />, label: 'Quote', insert: '> ' },
  { icon: <Code size={16} />, label: 'Code', insert: '```\n\n```', cursor: -4 },
  { icon: <Table size={16} />, label: 'Table', insert: '| Col1 | Col2 | Col3 |\n|------|------|------|\n| A    | B    | C    |' },
];

export default function MarkdownEditor({ value, onChange, label, rows = 10, placeholder }: MarkdownEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [uploadingImg, setUploadingImg] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const insertAtCursor = (text: string) => {
    const textarea = document.querySelector('.md-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      onChange(value + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newVal = value.substring(0, start) + text + value.substring(end);
    onChange(newVal);
    setTimeout(() => {
      textarea.setSelectionRange(start + text.length, start + text.length);
      textarea.focus();
    }, 10);
  };

  const handleToolbar = (insert: string, cursorOffset?: number) => {
    const textarea = document.querySelector('.md-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      onChange(value + insert);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newVal = value.substring(0, start) + insert + value.substring(end);
    onChange(newVal);
    setTimeout(() => {
      const pos = cursorOffset ? start + insert.length + cursorOffset : start + insert.length;
      textarea.setSelectionRange(pos, pos);
      textarea.focus();
    }, 10);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const md = `![${file.name}](${data.url})`;
      insertAtCursor(md);
    } catch {
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImg(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
      {label && (
        <label className="block text-sm font-medium text-gray-700 px-4 pt-3 pb-1">{label}</label>
      )}

      <div className="flex items-center justify-between bg-gray-50 border-b px-2 py-1.5 flex-wrap gap-1">
        <div className="flex items-center gap-0.5">
          {TOOLBAR_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => handleToolbar(btn.insert, btn.cursor)}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
              title={btn.label}
            >
              {btn.icon}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingImg}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            title="Insérer une image"
          >
            {uploadingImg ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Image size={16} />
            )}
          </button>
        </div>
        <div className="flex items-center bg-white rounded-lg border overflow-hidden">
          <button
            type="button"
            onClick={() => setTab('edit')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === 'edit' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Edit3 size={14} /> Éditer
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === 'preview' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye size={14} /> Aperçu
          </button>
        </div>
      </div>

      {tab === 'edit' ? (
        <textarea
          className="md-editor-textarea w-full px-4 py-3 outline-none resize-y min-h-[200px] font-mono text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder || 'Écrivez votre contenu ici... (Markdown supporté)'}
        />
      ) : (
        <div className="px-4 py-3 prose prose-primary max-w-none min-h-[200px] bg-white markdown-preview">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic">Aucun aperçu disponible</p>
          )}
        </div>
      )}
    </div>
  );
}
