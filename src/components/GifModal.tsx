import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  Star,
  Info,
  ExternalLink,
} from 'lucide-react';
import type { GifItem, BgPattern } from '../types';
import { downloadFile, formatBytes } from '../utils/gifUtils';

interface GifModalProps {
  item: GifItem | null;
  items: GifItem[];
  onClose: () => void;
  onNavigate: (newItem: GifItem) => void;
  onToggleFavorite: (id: string) => void;
}

export const GifModal: React.FC<GifModalProps> = ({
  item,
  items,
  onClose,
  onNavigate,
  onToggleFavorite,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [bgPattern, setBgPattern] = useState<BgPattern>('checker');
  const [copied, setCopied] = useState<boolean>(false);
  const [showMetadata, setShowMetadata] = useState<boolean>(true);

  // Reset zoom and playback when active item changes
  useEffect(() => {
    if (item) {
      setZoom(100);
      setIsPlaying(!item.isPaused);
    }
  }, [item]);

  const currentIndex = items.findIndex((i) => i.id === item?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1 && currentIndex !== -1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onNavigate(items[currentIndex - 1]);
    }
  }, [hasPrev, onNavigate, items, currentIndex]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onNavigate(items[currentIndex + 1]);
    }
  }, [hasNext, onNavigate, items, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose, handlePrev, handleNext]);

  if (!item) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const bgClass = (() => {
    switch (bgPattern) {
      case 'white':
        return 'bg-white';
      case 'dark':
        return 'bg-slate-950';
      case 'checker-dark':
        return 'bg-checker-dark';
      case 'checker':
      default:
        return 'bg-checker-light';
    }
  })();

  const resolutionCategory = (() => {
    const totalPixels = item.width * item.height;
    if (totalPixels >= 1920 * 1080) return '超清 (Full HD+)';
    if (totalPixels >= 1280 * 720) return '高清 (720p HD)';
    if (totalPixels >= 640 * 480) return '标清 (SD)';
    return '表情 / 头像尺寸';
  })();

  return (
    <div
      id="gif-inspect-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-2 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-full max-h-[92vh] bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="h-14 px-4 sm:px-6 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-medium border border-indigo-500/30 shrink-0">
              {currentIndex + 1} / {items.length}
            </span>
            <h2 className="text-sm font-semibold truncate text-slate-100 max-w-xs sm:max-w-md">
              {item.name}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? '定格/暂停 (空格键)' : '播放 (空格键)'}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Favorite */}
            <button
              onClick={() => onToggleFavorite(item.id)}
              title={item.favorite ? '已收藏' : '加入收藏'}
              className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Star
                className={`w-4 h-4 ${item.favorite ? 'fill-amber-400 text-amber-400' : ''}`}
              />
            </button>

            {/* Toggle info panel */}
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              title={showMetadata ? '隐藏文件信息' : '显示文件信息'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showMetadata ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={() => downloadFile(item.url, item.name)}
              title="下载到本地"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              title="关闭 (Esc)"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Display & Navigation */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Previous Button */}
          {hasPrev && (
            <button
              onClick={handlePrev}
              title="上一个 (←)"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-600 transition-transform active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          {hasNext && (
            <button
              onClick={handleNext}
              title="下一个 (→)"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-600 transition-transform active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Main Image Viewport with pan/zoom */}
          <div className={`flex-1 overflow-auto flex items-center justify-center p-4 ${bgClass}`}>
            <div
              className="transition-transform duration-100 flex items-center justify-center"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <img
                src={isPlaying ? item.url : (item.staticThumbUrl || item.url)}
                alt={item.name}
                className="max-h-[70vh] max-w-[80vw] object-contain shadow-2xl rounded-xs select-none pointer-events-none"
              />
            </div>
          </div>

          {/* Collapsible Metadata Sidebar */}
          {showMetadata && (
            <div className="w-72 bg-slate-850 bg-slate-900 border-l border-slate-800 p-5 text-slate-300 flex flex-col justify-between shrink-0 overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  动图详细参数
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-0.5">文件名</label>
                    <p className="font-medium text-white break-all">{item.name}</p>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">分辨率</label>
                    <p className="font-mono text-white text-sm">
                      {item.width} × {item.height} px
                    </p>
                    <span className="text-[11px] text-indigo-400 font-medium">
                      {resolutionCategory}
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">文件大小</label>
                    <p className="font-mono text-white">{item.formattedSize}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {item.size.toLocaleString()} 字节
                    </p>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-0.5">宽高比</label>
                    <p className="font-mono text-white">
                      {(item.width / (item.height || 1)).toFixed(2)}:1
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <label className="text-xs text-slate-400 block mb-2">背景底色</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setBgPattern('checker')}
                      className={`px-2 py-1.5 rounded text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer ${
                        bgPattern === 'checker'
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-xs bg-checker-light border border-slate-400" />
                      浅棋盘
                    </button>
                    <button
                      onClick={() => setBgPattern('white')}
                      className={`px-2 py-1.5 rounded text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer ${
                        bgPattern === 'white'
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-xs bg-white border border-slate-300" />
                      纯白
                    </button>
                    <button
                      onClick={() => setBgPattern('dark')}
                      className={`px-2 py-1.5 rounded text-xs font-medium border flex items-center justify-center gap-1 cursor-pointer ${
                        bgPattern === 'dark'
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-xs bg-slate-950 border border-slate-700" />
                      纯黑
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Tools */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleCopy}
                  className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      链接已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制图片 URL
                    </>
                  )}
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  新标签页中打开
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Zoom & View Controls Toolbar */}
        <div className="h-12 px-6 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(25, z - 25))}
              title="缩小"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono w-12 text-center text-slate-200">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(400, z + 25))}
              title="放大"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              title="重置缩放 (100%)"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
            <span>支持使用键盘方向键 ← / → 切换</span>
            <span>按空格键暂停/播放</span>
          </div>
        </div>
      </div>
    </div>
  );
};
