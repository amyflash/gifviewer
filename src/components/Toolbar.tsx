import React from 'react';
import {
  Search,
  Play,
  Pause,
  MousePointer,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  Columns4,
  ArrowUpDown,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
  Star,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { ViewSettings, GridColumns, ImageFitMode, BgPattern, PlaybackMode, SortOption } from '../types';

interface ToolbarProps {
  settings: ViewSettings;
  onUpdateSettings: (updates: Partial<ViewSettings>) => void;
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  showOnlyFavorites: boolean;
  onToggleFavoritesFilter: () => void;
  favoritesCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  settings,
  onUpdateSettings,
  totalCount,
  filteredCount,
  selectedCount,
  onSelectAll,
  onDeselectAll,
  showOnlyFavorites,
  onToggleFavoritesFilter,
  favoritesCount,
}) => {
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left Section: Search and Selection */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          {/* Multi-select toggle */}
          <button
            id="toolbar-select-all"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title={allSelected ? '取消全选' : '全选所有'}
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            ) : isIndeterminate ? (
              <div className="w-4 h-4 rounded border-2 border-indigo-600 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-indigo-600" />
              </div>
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {allSelected ? '取消全选' : '全选'}
            </span>
          </button>

          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="toolbar-search-input"
              type="text"
              placeholder="搜索文件名..."
              value={settings.searchQuery}
              onChange={(e) => onUpdateSettings({ searchQuery: e.target.value })}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg outline-hidden text-slate-800 placeholder-slate-400 transition-all"
            />
            {settings.searchQuery && (
              <button
                onClick={() => onUpdateSettings({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Favorites filter button */}
          <button
            id="toolbar-filter-favorites"
            onClick={onToggleFavoritesFilter}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              showOnlyFavorites
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="只显示已加星标的收藏 GIF"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                showOnlyFavorites ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">收藏</span>
            {favoritesCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded-full font-semibold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Results feedback if searching */}
          {settings.searchQuery && (
            <span className="text-xs text-slate-500 hidden md:inline">
              找到 {filteredCount} / {totalCount}
            </span>
          )}
        </div>

        {/* Right Section: View settings */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Playback Mode */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
            <button
              id="playback-all"
              onClick={() => onUpdateSettings({ playbackMode: 'all' })}
              title="全部播放动画"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                settings.playbackMode === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden lg:inline">全部播放</span>
            </button>
            <button
              id="playback-hover"
              onClick={() => onUpdateSettings({ playbackMode: 'hover' })}
              title="鼠标悬停时播放（节省资源）"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                settings.playbackMode === 'hover'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MousePointer className="w-3 h-3" />
              <span className="hidden lg:inline">悬停播放</span>
            </button>
            <button
              id="playback-pause"
              onClick={() => onUpdateSettings({ playbackMode: 'pause' })}
              title="全部定格暂停"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                settings.playbackMode === 'pause'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pause className="w-3 h-3" />
              <span className="hidden lg:inline">全部暂停</span>
            </button>
          </div>

          {/* Background pattern */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
            <button
              id="bg-pattern-checker"
              onClick={() => onUpdateSettings({ bgPattern: 'checker' })}
              title="透明棋盘格底色（推荐透明动图）"
              className={`px-2 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                settings.bgPattern === 'checker'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs border border-slate-300 bg-checker-light" />
                <span className="hidden xl:inline">棋盘</span>
              </span>
            </button>
            <button
              id="bg-pattern-white"
              onClick={() => onUpdateSettings({ bgPattern: 'white' })}
              title="纯白底色"
              className={`px-2 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                settings.bgPattern === 'white'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs border border-slate-300 bg-white" />
                <span className="hidden xl:inline">纯白</span>
              </span>
            </button>
            <button
              id="bg-pattern-dark"
              onClick={() => onUpdateSettings({ bgPattern: 'dark' })}
              title="深黑底色"
              className={`px-2 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                settings.bgPattern === 'dark'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-xs border border-slate-600 bg-slate-900" />
                <span className="hidden xl:inline">暗黑</span>
              </span>
            </button>
          </div>

          {/* Fit Mode Toggle */}
          <button
            id="toolbar-fit-mode"
            onClick={() =>
              onUpdateSettings({
                fitMode: settings.fitMode === 'contain' ? 'cover' : 'contain',
              })
            }
            title={settings.fitMode === 'contain' ? '当前模式: 完整显示(Contain)' : '当前模式: 裁剪填满(Cover)'}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {settings.fitMode === 'contain' ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline">完整适应</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline">裁剪填满</span>
              </>
            )}
          </button>

          {/* Grid Columns */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
            {([2, 3, 4, 5, 6] as GridColumns[]).map((col) => (
              <button
                key={col}
                id={`grid-cols-${col}`}
                onClick={() => onUpdateSettings({ columns: col })}
                title={`${col} 列网格`}
                className={`w-7 h-6 text-xs font-medium rounded-md flex items-center justify-center transition-all cursor-pointer ${
                  settings.columns === col
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {col}列
              </button>
            ))}
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <select
              id="toolbar-sort-select"
              value={settings.sortBy}
              onChange={(e) => onUpdateSettings({ sortBy: e.target.value as SortOption })}
              className="appearance-none pl-7 pr-7 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden cursor-pointer"
            >
              <option value="date-desc">最新添加</option>
              <option value="date-asc">最早添加</option>
              <option value="name-asc">名称 (A - Z)</option>
              <option value="name-desc">名称 (Z - A)</option>
              <option value="size-desc">文件大小 (大到小)</option>
              <option value="size-asc">文件大小 (小到大)</option>
              <option value="dim-desc">分辨率 (大到小)</option>
              <option value="dim-asc">分辨率 (小到大)</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
