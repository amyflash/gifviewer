import React, { useState } from 'react';
import { Download, Trash2, Play, Pause, Copy, Check, X, Loader2 } from 'lucide-react';
import type { GifItem } from '../types';
import { downloadGifsAsZip } from '../utils/gifUtils';

interface BatchActionBarProps {
  selectedItems: GifItem[];
  onDeselectAll: () => void;
  onBatchDelete: () => void;
  onBatchPlay: () => void;
  onBatchPause: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedItems,
  onDeselectAll,
  onBatchDelete,
  onBatchPlay,
  onBatchPause,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [copiedNames, setCopiedNames] = useState(false);

  if (selectedItems.length === 0) return null;

  const handleDownloadZip = async () => {
    if (isZipping) return;
    setIsZipping(true);
    setZipProgress(0);
    try {
      await downloadGifsAsZip(selectedItems, `gifs-batch-${selectedItems.length}.zip`, (percent) => {
        setZipProgress(percent);
      });
    } catch (err) {
      console.error('Failed to export zip', err);
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  const handleCopyNames = async () => {
    const names = selectedItems.map((i) => i.name).join('\n');
    try {
      await navigator.clipboard.writeText(names);
      setCopiedNames(true);
      setTimeout(() => setCopiedNames(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      id="batch-action-bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-xs font-semibold text-slate-200">
          已选择 <strong className="text-white font-mono">{selectedItems.length}</strong> 项
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Batch Download ZIP */}
        <button
          id="batch-btn-download-zip"
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium transition-colors shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isZipping ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>打包中 {zipProgress}%</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>打包下载 ZIP</span>
            </>
          )}
        </button>

        {/* Play/Pause batch */}
        <button
          onClick={onBatchPlay}
          title="播放所选项"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onBatchPause}
          title="暂停所选项"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Pause className="w-3.5 h-3.5" />
        </button>

        {/* Copy file list */}
        <button
          onClick={handleCopyNames}
          title="复制所有选中文件的名称"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          {copiedNames ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Delete */}
        <button
          onClick={onBatchDelete}
          title="从列表中移除选中项"
          className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Cancel selection */}
        <button
          onClick={onDeselectAll}
          title="取消选择"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
