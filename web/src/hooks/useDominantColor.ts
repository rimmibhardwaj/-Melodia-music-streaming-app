import { useState, useEffect } from 'react';
import { Vibrant } from 'node-vibrant/browser';

// Simple in-memory cache to avoid re-calculating colors for identical URLs
const colorCache = new Map<string, string>();

const DEFAULT_COLOR = '#FF3366';

export function useDominantColor(imageUrl?: string | null) {
  const [color, setColor] = useState<string>(DEFAULT_COLOR);

  useEffect(() => {
    if (!imageUrl) {
      setColor(DEFAULT_COLOR);
      return;
    }

    if (colorCache.has(imageUrl)) {
      setColor(colorCache.get(imageUrl)!);
      return;
    }

    let isMounted = true;

    // Use node-vibrant to extract the dominant/vibrant color
    const extractColor = async () => {
      try {
        // Need to set crossOrigin to anonymous for canvas extraction to work
        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = imageUrl;

        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });

        const palette = await Vibrant.from(image).getPalette();
        
        if (!isMounted) return;

        // Try to pick Vibrant, then LightVibrant, then fallback
        const extractedColor = palette.Vibrant?.hex || palette.LightVibrant?.hex || DEFAULT_COLOR;
        
        colorCache.set(imageUrl, extractedColor);
        setColor(extractedColor);
      } catch (error) {
        console.warn('Failed to extract color from image:', imageUrl, error);
        if (isMounted) {
          // If cross-origin or other error, fallback to default and cache it
          colorCache.set(imageUrl, DEFAULT_COLOR);
          setColor(DEFAULT_COLOR);
        }
      }
    };

    extractColor();

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return color;
}
