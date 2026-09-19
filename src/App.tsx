/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UploadCloud, Film, Sparkles } from 'lucide-react';
import type { GifItem, ViewSettings, GridColumns } from './types';
import {
  formatBytes,
  getImageMetadata,
  scanFilesFromDataTransfer,
  SAMPLE_GIFS,
} from './utils/gifUtils';
import { Navbar } from './components/Navbar';
import { Toolbar } from './components/Toolbar';
import { DropZone } from './components/DropZone';
import { GifCard } from './components/GifCard';
import { GifModal } from './components/GifModal';
import { BatchActionBar } from './components/BatchActionBar';

export default function App() {
  const [items, setItems] = useState<GifItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOverWindow, setIsDragOverWindow] = useState(false);
  const [inspectItem, setInspectItem] = useState<GifItem | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Layout and display settings
  const [settings, setSettings] = useState<ViewSettings>({
    columns: 4,
    fitMode: 'contain',
    bgPattern: 'checker',
    playbackMode: 'all',
    sortBy: 'date-desc',
    searchQuery: '',
    showDetails: true,
    cardSize: 'normal',
  });

  const updateSettings = useCallback((updates: Partial<ViewSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Process incoming files into GifItem objects
  const processFiles = useCallback(async (incoming: File[] | FileList) => {
    const files = Array.from(incoming);
    if (files.length === 0) return;
    setIsLoading(true);

    const newItems: GifItem[] = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      try {
        const meta = await getImageMetadata(url);
        newItems.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          formattedSize: formatBytes(file.size),
          url,
          width: meta.width,
          height: meta.height,
          aspectRatio: meta.width / (meta.height || 1),
          staticThumbUrl: meta.staticThumbUrl,
          createdAt: Date.now(),
          selected: false,
          isPaused: false,
          favorite: false,
        });
      } catch (e) {
        console.error('Error processing GIF file:', file.name, e);
      }
    }

    setItems((prev) => [...newItems, ...prev]);
    setIsLoading(false);
  }, []);

  // Load sample GIFs
  const handleLoadSamples = useCallback(async () => {
    setIsLoading(true);
    const newItems: GifItem[] = [];

    for (const sample of SAMPLE_GIFS) {
      try {
        const meta = await getImageMetadata(sample.url);
        newItems.push({
          id: `sample-${sample.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: sample.name,
          size: sample.size,
          formattedSize: formatBytes(sample.size),
          url: sample.url,
          width: meta.width,
          height: meta.height,
          aspectRatio: meta.width / (meta.height || 1),
          staticThumbUrl: meta.staticThumbUrl,
          createdAt: Date.now(),
          selected: false,
          isPaused: false,
          favorite: false,
        });
      } catch (err) {
        console.error('Failed to load sample', sample.name, err);
      }
    }

    setItems((prev) => [...newItems, ...prev]);
    setIsLoading(false);
  }, []);

  // Global paste handler to paste GIF images/files directly
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      const gifFiles: File[] = [];
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.includes('gif') || item.type.includes('image')) {
          const file = item.getAsFile();
          if (file) {
            gifFiles.push(file);
          }
        }
      }

      if (gifFiles.length > 0) {
        processFiles(gifFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  // Window-wide drag and drop events
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDragOverWindow(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDragOverWindow(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragOverWindow(false);

      if (e.dataTransfer?.items) {
        const files = await scanFilesFromDataTransfer(e.dataTransfer.items);
        if (files.length > 0) {
          processFiles(files);
        }
      } else if (e.dataTransfer?.files) {
        const files = Array.from(e.dataTransfer.files).filter(
          (f) => f.type === 'image/gif' || f.name.toLowerCase().endsWith('.gif')
        );
        if (files.length > 0) {
          processFiles(files);
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [processFiles]);

  // Handle clearing all with object URL cleanup
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有预览中的 GIF 动图吗？')) {
      items.forEach((item) => {
        if (item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
      setItems([]);
      setInspectItem(null);
    }
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target && target.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((i) => i.id !== id);
    });
    if (inspectItem?.id === id) {
      setInspectItem(null);
    }
  };

  // Toggle individual card select
  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Select all / Deselect all
  const handleSelectAll = () => {
    setItems((prev) => prev.map((i) => ({ ...i, selected: true })));
  };

  const handleDeselectAll = () => {
    setItems((prev) => prev.map((i) => ({ ...i, selected: false })));
  };

  // Toggle individual play/pause
  const handleTogglePlay = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPaused: !item.isPaused } : item
      )
    );
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );
    if (inspectItem && inspectItem.id === id) {
      setInspectItem((prev) => (prev ? { ...prev, favorite: !prev.favorite } : null));
    }
  };

  // Batch operations
  const handleBatchDelete = () => {
    const selectedCount = items.filter((i) => i.selected).length;
    if (window.confirm(`确定要移除选中的 ${selectedCount} 个 GIF 吗？`)) {
      items.forEach((item) => {
        if (item.selected && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
      setItems((prev) => prev.filter((i) => !i.selected));
    }
  };

  const handleBatchPlay = () => {
    setItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, isPaused: false } : item))
    );
  };

  const handleBatchPause = () => {
    setItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, isPaused: true } : item))
    );
  };

  // Filter and Sort Items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter favorites
    if (showOnlyFavorites) {
      result = result.filter((i) => i.favorite);
    }

    // Filter search query
    if (settings.searchQuery.trim()) {
      const q = settings.searchQuery.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      switch (settings.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name, undefined, { numeric: true });
        case 'name-desc':
          return b.name.localeCompare(a.name, undefined, { numeric: true });
        case 'size-desc':
          return b.size - a.size;
        case 'size-asc':
          return a.size - b.size;
        case 'dim-desc':
          return b.width * b.height - a.width * a.height;
        case 'dim-asc':
          return a.width * a.height - b.width * b.height;
        case 'date-asc':
          return a.createdAt - b.createdAt;
        case 'date-desc':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [items, showOnlyFavorites, settings.searchQuery, settings.sortBy]);

  // Statistics
  const totalCount = items.length;
  const totalSize = useMemo(() => items.reduce((acc, i) => acc + i.size, 0), [items]);
  const selectedItems = useMemo(() => items.filter((i) => i.selected), [items]);
  const favoritesCount = useMemo(() => items.filter((i) => i.favorite).length, [items]);

  // Dynamic Tailwind grid column class
  const gridColumnClass = (() => {
    switch (settings.columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      case 5:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white relative">
      {/* Top Navigation */}
      <Navbar
        totalCount={totalCount}
        totalSize={totalSize}
        onFilesSelected={processFiles}
        onLoadSamples={handleLoadSamples}
        onClearAll={handleClearAll}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {totalCount === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <DropZone
              onFilesDropped={processFiles}
              onLoadSamples={handleLoadSamples}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <>
            {/* Action Toolbar */}
            <Toolbar
              settings={settings}
              onUpdateSettings={updateSettings}
              totalCount={totalCount}
              filteredCount={filteredAndSortedItems.length}
              selectedCount={selectedItems.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              showOnlyFavorites={showOnlyFavorites}
              onToggleFavoritesFilter={() => setShowOnlyFavorites((f) => !f)}
              favoritesCount={favoritesCount}
            />

            {/* Grid Container */}
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
              {filteredAndSortedItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
                  <Film className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-base font-medium text-slate-700">
                    没有找到符合条件的 GIF 动图
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    请尝试清除搜索关键词或调整收藏筛选条件
                  </p>
                  <button
                    onClick={() => {
                      updateSettings({ searchQuery: '' });
                      setShowOnlyFavorites(false);
                    }}
                    className="mt-4 px-4 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                  >
                    重置筛选条件
                  </button>
                </div>
              ) : (
                <div className={`grid ${gridColumnClass} gap-4 sm:gap-5`}>
                  {filteredAndSortedItems.map((item) => (
                    <GifCard
                      key={item.id}
                      item={item}
                      settings={settings}
                      onToggleSelect={handleToggleSelect}
                      onTogglePlay={handleTogglePlay}
                      onToggleFavorite={handleToggleFavorite}
                      onRemove={handleRemoveItem}
                      onOpenModal={(selected) => setInspectItem(selected)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Lightbox / Modal for inspecting single GIF */}
      <GifModal
        item={inspectItem}
        items={filteredAndSortedItems}
        onClose={() => setInspectItem(null)}
        onNavigate={(newItem) => setInspectItem(newItem)}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedItems={selectedItems}
        onDeselectAll={handleDeselectAll}
        onBatchDelete={handleBatchDelete}
        onBatchPlay={handleBatchPlay}
        onBatchPause={handleBatchPause}
      />

      {/* Fullscreen Drag Overlay when dragging files anywhere into window */}
      {isDragOverWindow && (
        <div className="fixed inset-0 z-50 bg-indigo-600/85 backdrop-blur-sm flex flex-col items-center justify-center text-white pointer-events-none animate-in fade-in duration-150">
          <div className="w-24 h-24 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center mb-6 shadow-2xl animate-bounce">
            <UploadCloud className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            释放鼠标立即在本地打开预览
          </h2>
          <p className="text-sm text-indigo-100">
            纯本地解析 · 绝不上传服务器 · 支持多文件或文件夹拖入
          </p>
        </div>
      )}

      {/* Footer info */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            100% 纯本地离线解析，文件绝不上载至任何云端服务器
          </span>
          <span className="text-[11px] text-slate-400">
            Blob URL 本地即时渲染 · 隐私完全隔离 · 支持 Ctrl+V 剪贴板粘贴
          </span>
        </div>
      </footer>
    </div>
  );
}
