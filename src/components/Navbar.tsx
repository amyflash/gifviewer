import React, { useRef } from 'react';
import { FolderOpen, Plus, Trash2, Sparkles, Film, ShieldCheck } from 'lucide-react';
import { formatBytes } from '../utils/gifUtils';

interface NavbarProps {
  totalCount: number;
  totalSize: number;
  onFilesSelected: (files: FileList | File[]) => void;
  onLoadSamples: () => void;
  onClearAll: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  totalSize,
  onFilesSelected,
  onLoadSamples,
  onClearAll,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate">
                GIF 批量预览
              </h1>
              <span className="text-[11px] font-medium tracking-wide flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                纯本地离线
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block truncate">
              文件仅在浏览器本地内存解析 · 绝不上载服务器
            </p>
          </div>
        </div>

        {/* Counter stats */}
        {totalCount > 0 && (
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-100/90 text-xs font-medium text-slate-600 border border-slate-200/70">
            <span>
              已载入 <strong className="text-slate-900">{totalCount}</strong> 个本地 GIF
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span>
              总大小 <strong className="text-slate-900">{formatBytes(totalSize)}</strong>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/gif,.gif"
            className="hidden"
            onChange={handleFileChange}
            id="file-upload-input"
          />
          {/* Webkitdirectory for folder upload */}
          <input
            ref={folderInputRef}
            type="file"
            multiple
            // @ts-expect-error webkitdirectory is standard in Chromium/modern browsers
            webkitdirectory=""
            className="hidden"
            onChange={handleFileChange}
            id="folder-upload-input"
          />

          <button
            id="btn-sample-gifs"
            onClick={onLoadSamples}
            disabled={isLoading}
            title="加载精选示例 GIF 动图快速体验"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            示例动图
          </button>

          <button
            id="btn-upload-folder"
            onClick={() => folderInputRef.current?.click()}
            disabled={isLoading}
            title="读取本地文件夹中的所有 GIF（不上传）"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
            打开本地文件夹
          </button>

          <button
            id="btn-upload-files"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="选择本地 GIF 文件直接在浏览器中打开预览"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            打开本地文件
          </button>

          {totalCount > 0 && (
            <button
              id="btn-clear-all"
              onClick={onClearAll}
              title="清空当前所有本地 GIF 预览"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
