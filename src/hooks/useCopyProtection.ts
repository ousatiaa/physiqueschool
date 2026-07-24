'use client';

import { useEffect, useCallback } from 'react';

export function useCopyProtection(enabled: boolean = true) {
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (enabled) e.preventDefault();
  }, [enabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    if (
      (e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 'u'].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }
    if (e.key === 'PrintScreen') {
      e.preventDefault();
    }
  }, [enabled]);

  const handleSelectStart = useCallback((e: Event) => {
    if (enabled) e.preventDefault();
  }, [enabled]);

  const handleDragStart = useCallback((e: DragEvent) => {
    if (enabled) e.preventDefault();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [enabled, handleContextMenu, handleKeyDown, handleSelectStart, handleDragStart]);
}
