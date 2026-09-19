import JSZip from 'jszip';
import type { GifItem } from '../types';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getImageMetadata(
  url: string
): Promise<{ width: number; height: number; staticThumbUrl: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const width = img.naturalWidth || 300;
      const height = img.naturalHeight || 200;
      let staticThumbUrl = '';
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          staticThumbUrl = canvas.toDataURL('image/png');
        }
      } catch {
        // If tainted canvas due to cross-origin, staticThumbUrl remains empty
        staticThumbUrl = url;
      }

      resolve({
        width,
        height,
        staticThumbUrl: staticThumbUrl || url,
      });
    };
    img.onerror = () => {
      resolve({
        width: 300,
        height: 200,
        staticThumbUrl: url,
      });
    };
    img.src = url;
  });
}

// Download single file helper
export function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Batch download as ZIP
export async function downloadGifsAsZip(
  items: GifItem[],
  zipFilename = 'gifs-bundle.zip',
  onProgress?: (percent: number) => void
) {
  const zip = new JSZip();
  const folder = zip.folder('gifs') || zip;

  let loaded = 0;
  for (const item of items) {
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      // Ensure unique filename inside zip
      const safeName = item.name.toLowerCase().endsWith('.gif') ? item.name : `${item.name}.gif`;
      folder.file(safeName, blob);
    } catch (e) {
      console.error('Failed to bundle file into zip:', item.name, e);
    }
    loaded++;
    if (onProgress) {
      onProgress(Math.round((loaded / items.length) * 80));
    }
  }

  const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) {
      onProgress(80 + Math.round(metadata.percent * 0.2));
    }
  });

  const downloadUrl = URL.createObjectURL(content);
  downloadFile(downloadUrl, zipFilename);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}

// Recursive entry scanner for folder drag-and-drop
export async function scanFilesFromDataTransfer(
  items: DataTransferItemList
): Promise<File[]> {
  const files: File[] = [];

  const traverseFileTree = async (item: any): Promise<void> => {
    if (!item) return;
    if (item.isFile) {
      return new Promise((resolve) => {
        item.file((file: File) => {
          if (file && (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif'))) {
            files.push(file);
          }
          resolve();
        });
      });
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      const readEntries = (): Promise<any[]> =>
        new Promise((resolve) => {
          dirReader.readEntries((entries: any[]) => resolve(entries));
        });

      let entries = await readEntries();
      while (entries.length > 0) {
        for (const entry of entries) {
          await traverseFileTree(entry);
        }
        entries = await readEntries();
      }
    }
  };

  const queue: Promise<void>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (typeof item.webkitGetAsEntry === 'function') {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        queue.push(traverseFileTree(entry));
        continue;
      }
    }
    const file = item.getAsFile();
    if (file && (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif'))) {
      files.push(file);
    }
  }

  await Promise.all(queue);
  return files;
}

// Curated high quality sample GIFs (public Wikimedia Commons / Wikimedia assets)
export const SAMPLE_GIFS = [
  {
    name: 'Rotating_Earth_Animation.gif',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif',
    size: 268435,
  },
  {
    name: 'Newton_Cradle_Simulation.gif',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Newtons_cradle_animation_book_2.gif',
    size: 512000,
  },
  {
    name: 'Hypnotic_Spiral_Motion.gif',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Spiral_in_stereographic_projection.gif',
    size: 420000,
  },
  {
    name: 'Tesseract_Hypercube_Rotation.gif',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Tesseract.gif',
    size: 345000,
  },
  {
    name: 'Walking_Stick_Figure.gif',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Animated-Walking-Stick-Figure.gif',
    size: 180000,
  },
  {
    name: 'Wave_Phase_Interference.gif',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Wave_packet_dispersion.gif',
    size: 310000,
  },
];
