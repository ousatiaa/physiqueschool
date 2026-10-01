'use client';

import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCopyProtection } from '@/hooks/useCopyProtection';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  disableCopy?: boolean;
  onContentLoaded?: () => void;
}

export default function MarkdownRenderer({ content, className = '', disableCopy = false, onContentLoaded }: MarkdownRendererProps) {
  useCopyProtection(disableCopy);

  useEffect(() => {
    onContentLoaded?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`prose prose-primary max-w-none markdown-preview ${className} ${disableCopy ? 'no-select no-copy' : ''}`}
      onContextMenu={disableCopy ? (e) => e.preventDefault() : undefined}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
