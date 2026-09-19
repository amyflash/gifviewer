import React, { useRef } from 'react';
import { Plus, FolderOpen, Sparkles, ShieldCheck, HardDrive, Cpu, Zap } from 'lucide-react';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  onLoadSamples: () => void;
  isLoading: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesDropped,
  onLoadSamples,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const gifFiles = Array.from(e.target.files).filter(
        (f) => f.type === 'image/gif' || f.name.toLowerCase().endsWith('.gif')
      );
      if (gifFiles.length > 0) {
        onFilesDropped(gifFiles);
      }
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const gifFiles = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === 'image/gif' || f.name.toLowerCase().endsWith('.gif')
      );
      if (gifFiles.length > 0) {
        onFilesDropped(gifFiles);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/gif,.gif"
        className="hidden"
        onChange={handleFileChange}
        id="empty-dropzone-files"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error webkitdirectory is standard
        webkitdirectory=""
        className="hidden"
        onChange={handleFileChange}
        id="empty-dropzone-folder"
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative group border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/30 rounded-3xl p-8 sm:p-14 text-center transition-all duration-200 shadow-xs hover:shadow-md"
      >
        {/* Privacy badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/80 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% 纯本地离线预览 · 无需上传到服务器</span>
        </div>

        {/* Glow accent */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-100/80 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform duration-200 shadow-inner">
          <HardDrive className="w-10 h-10" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-2">
          拖拽本地 GIF 到此处直接预览
        </h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed">
          文件完全在您的浏览器本地内存中解析显示，<strong>绝不上传任何远程服务器</strong>。支持本地文件多选、文件夹批量导入与剪贴板粘贴。
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
          <button
            id="dropzone-btn-select-files"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            打开本地 GIF 文件
          </button>

          <button
            id="dropzone-btn-select-folder"
            onClick={() => folderInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4 text-slate-500" />
            选择本地文件夹
          </button>

          <button
            id="dropzone-btn-load-samples"
            onClick={onLoadSamples}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            加载示例动图体验
          </button>
        </div>

        {/* Feature highlight list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/70 text-left max-w-2xl mx-auto">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-700">零服务器传输</p>
              <p className="text-[11px] text-slate-500">Blob URL 本地即时解析，断网也能正常运行</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Cpu className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-700">极速硬件加速</p>
              <p className="text-[11px] text-slate-500">毫秒级生成网格列表，支持定格与悬停播放</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-700">批量便捷管理</p>
              <p className="text-[11px] text-slate-500">尺寸检测、多选筛选与本地打包 ZIP 导出</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
