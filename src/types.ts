export interface GifItem {
  id: string;
  file?: File;
  name: string;
  size: number;
  formattedSize: string;
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
  staticThumbUrl: string;
  createdAt: number;
  selected: boolean;
  isPaused: boolean;
  favorite: boolean;
}

export type GridColumns = 2 | 3 | 4 | 5 | 6;
export type ImageFitMode = 'contain' | 'cover' | 'original';
export type BgPattern = 'checker' | 'white' | 'dark' | 'checker-dark';
export type PlaybackMode = 'all' | 'hover' | 'pause';
export type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc' | 'dim-desc' | 'dim-asc';

export interface ViewSettings {
  columns: GridColumns;
  fitMode: ImageFitMode;
  bgPattern: BgPattern;
  playbackMode: PlaybackMode;
  sortBy: SortOption;
  searchQuery: string;
  showDetails: boolean;
  cardSize: 'compact' | 'normal' | 'large';
}
