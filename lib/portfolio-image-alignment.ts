export interface CompareFocus {
  x: number;
  y: number;
}

const DEFAULT_FOCUS: CompareFocus = { x: 0.5, y: 0.5 };

/** Maps a focal point (0–1) to object-position for object-fit: cover. */
export function focusToObjectPosition(
  focus: CompareFocus = DEFAULT_FOCUS,
): string {
  const x = Math.min(1, Math.max(0, focus.x));
  const y = Math.min(1, Math.max(0, focus.y));
  return `${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`;
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function getCachedImageElement(src: string): Promise<HTMLImageElement> {
  const existing = imageCache.get(src);
  if (existing) return existing;

  const pending = loadImageElement(src);
  imageCache.set(src, pending);
  pending.catch(() => {
    imageCache.delete(src);
  });
  return pending;
}

export function preloadImageSources(sources: string[]): void {
  for (const src of sources) {
    void getCachedImageElement(src);
  }
}

/**
 * When before/after have different aspect ratios, nudge object-position so the
 * same focal point lands near the center of the compare frame.
 */
export function getAlignedObjectPositions(
  before: HTMLImageElement,
  after: HTMLImageElement,
  containerWidth: number,
  containerHeight: number,
  focus: CompareFocus = DEFAULT_FOCUS,
): { before: string; after: string } {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return {
      before: focusToObjectPosition(focus),
      after: focusToObjectPosition(focus),
    };
  }

  const containerRatio = containerWidth / containerHeight;

  function positionForImage(
    naturalWidth: number,
    naturalHeight: number,
  ): string {
    const imageRatio = naturalWidth / naturalHeight;

    if (Math.abs(imageRatio - containerRatio) < 0.02) {
      return focusToObjectPosition(focus);
    }

    if (imageRatio > containerRatio) {
      const scaledWidth = naturalHeight * containerRatio;
      const cropX = (naturalWidth - scaledWidth) * focus.x;
      const overflow = naturalWidth - scaledWidth;
      const adjustedX =
        overflow > 0 ? (cropX / overflow) * 100 : focus.x * 100;
      return `${adjustedX.toFixed(1)}% ${(focus.y * 100).toFixed(1)}%`;
    }

    const scaledHeight = naturalWidth / containerRatio;
    const cropY = (naturalHeight - scaledHeight) * focus.y;
    const overflow = naturalHeight - scaledHeight;
    const adjustedY =
      overflow > 0 ? (cropY / overflow) * 100 : focus.y * 100;
    return `${(focus.x * 100).toFixed(1)}% ${adjustedY.toFixed(1)}%`;
  }

  return {
    before: positionForImage(before.naturalWidth, before.naturalHeight),
    after: positionForImage(after.naturalWidth, after.naturalHeight),
  };
}
