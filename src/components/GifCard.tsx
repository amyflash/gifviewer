import React, { useState } from 'react';
import {
  Play,
  Pause,
  Star,
  Download,
  Eye,
  Trash2,
  Copy,
  Check,
  Maximize2,
} from 'lucide-react';
import type { GifItem, ViewSettings } from '../types';
import { downloadFile } from '../utils/gifUtils';

interface GifCardProps {
  item: GifItem;
  settings: ViewSettings;
  onToggleSelect: (id: string) => void;
  onTogglePlay: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onOpenModal: (item: GifItem) => void;
}

export const GifCard: React.FC<GifCardProps> = ({
  item,
  settings,
  onToggleSelect,
  onTogglePlay,
  onToggleFavorite,
  onRemove,
  onOpenModal,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine whether the GIF should currently play or display static frame
  const shouldPlay = (() => {
    if (settings.playbackMode === 'hover') {
      return isHovered;
    }
    if (settings.playbackMode === 'pause') {
      return item.isPaused === false;
    }
    // settings.playbackMode === 'all'
    return !item.isPaused;
  })();

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadFile(item.url, item.name);
  };

  // Background pattern class
  const bgClass = (() => {
    switch (settings.bgPattern) {
      case 'white':
        return 'bg-white';
      case 'dark':
        return 'bg-slate-900';
      case 'checker-dark':
        return 'bg-checker-dark';
      case 'checker':
      default:
        return 'bg-checker-light';
    }
  })();

  const aspectRatioString = (() => {
    if (!item.width || !item.height) return '';
    const ratio = item.width / item.height;
    if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9';
    if (Math.abs(ratio - 4 / 3) < 0.05) return '4:3';
    if (Math.abs(ratio - 1) < 0.05) return '1:1';
    if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16';
    return `${item.width}:${item.height}`;
  })();

  return (
    <div
      id={`gif-card-${item.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col rounded-xl border transition-all duration-200 overflow-hidden bg-white ${
        item.selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Visual Canvas Area */}
      <div
        className={`relative w-full aspect-square flex items-center justify-center cursor-pointer overflow-hidden ${bgClass}`}
        onClick={() => onOpenModal(item)}
      >
        {/* GIF / Static Frame */}
        <img
          src={shouldPlay ? item.url : (item.staticThumbUrl || item.url)}
          alt={item.name}
          loading="lazy"
          className={`w-full h-full transition-transform duration-200 ${
            settings.fitMode === 'cover' ? 'object-cover' : 'object-contain'
          } ${isHovered && settings.fitMode === 'contain' ? 'scale-[1.02]' : ''}`}
        />

        {/* Top Floating Overlay (Always accessible) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(item.id);
            }}
            aria-label={item.selected ? '取消选中' : '选中'}
            className={`pointer-events-auto w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              item.selected
                ? 'bg-indigo-600 text-white'
                : 'bg-white/80 backdrop-blur-xs text-slate-400 hover:text-slate-700 hover:bg-white border border-slate-200'
            }`}
          >
            {item.selected ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <div className="w-2 h-2 rounded-xs border border-slate-400" />
            )}
          </button>

          {/* Action pills: Favorite & Play/Pause */}
          <div className="pointer-events-auto flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            {/* Play/Pause state toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay(item.id);
              }}
              title={shouldPlay ? '定格/暂停' : '播放'}
              className="w-6 h-6 rounded-md bg-white/90 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-indigo-600 flex items-center justify-center shadow-xs border border-slate-200/80 transition-transform active:scale-95 cursor-pointer"
            >
              {shouldPlay ? (
                <Pause className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current ml-0.5" />
              )}
            </button>

            {/* Favorite star */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              title={item.favorite ? '取消收藏' : '加入收藏'}
              className={`w-6 h-6 rounded-md backdrop-blur-xs flex items-center justify-center shadow-xs border transition-transform active:scale-95 cursor-pointer ${
                item.favorite
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white/90 hover:bg-white text-slate-400 hover:text-amber-500 border-slate-200/80'
              }`}
            >
              <Star
                className={`w-3 h-3 ${item.favorite ? 'fill-white' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Hover quick overlay actions in center/bottom */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(item);
            }}
            className="pointer-events-auto px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 text-xs font-medium shadow-md flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            查看大图
          </button>
        </div>

        {/* Playback mode indicator pill (if hover mode or paused) */}
        {settings.playbackMode === 'hover' && !isHovered && (
          <div className="absolute bottom-2 left-2 pointer-events-none px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium flex items-center gap-1">
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>悬停播放</span>
          </div>
        )}
      </div>

      {/* Card Info Footer */}
      <div className="p-3 flex flex-col justify-between flex-1 bg-white border-t border-slate-100">
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <h3
            className="text-xs font-semibold text-slate-800 truncate"
            title={item.name}
          >
            {item.name}
          </h3>
          <span className="text-[11px] font-mono text-slate-500 shrink-0">
            {item.formattedSize}
          </span>
        </div>

        {/* Dimensions and Metadata */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span className="font-mono bg-slate-100/90 text-slate-600 px-1.5 py-0.5 rounded-sm">
            {item.width} × {item.height}
          </span>
          {aspectRatioString && (
            <span className="text-slate-400 text-[10px]">
              {aspectRatioString}
            </span>
          )}

          {/* Quick card action icons */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handleCopyLink}
              title="复制链接"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={handleDownload}
              title="下载此 GIF"
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              title="移除"
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
