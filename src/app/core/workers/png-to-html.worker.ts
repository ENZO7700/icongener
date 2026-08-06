/// <reference lib="webworker" />

export interface PixelData {
  x: number;
  y: number;
  color: string;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

addEventListener('message', ({ data }) => {
  const { imageData, numColors } = data;
  const { width, height, data: pixels } = imageData;

  // 1. Quantize colors
  const colorMap = new Map<string, string>();
  const colors: string[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = pixels[index + 3];

      if (a > 0) {
        const color = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
        colors.push(color);
      }
    }
  }

  if (colors.length <= numColors) {
    colors.forEach(color => colorMap.set(color, color));
  } else {
    const colorCounts = new Map<string, number>();
    colors.forEach(color => {
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    });

    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, numColors);

    sortedColors.forEach(([color]) => colorMap.set(color, color));
  }

  const pixelData: PixelData[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = pixels[index + 3];

      if (a > 0) {
        const originalColor = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
        const quantizedColor = colorMap.get(originalColor) || originalColor;
        pixelData.push({ x, y, color: quantizedColor });
      }
    }
  }

  // 2. Apply RLE
  const rectangles: Rectangle[] = [];
  const grid: Map<number, Map<number, string>> = new Map();
  pixelData.forEach(pixel => {
    if (!grid.has(pixel.y)) {
      grid.set(pixel.y, new Map());
    }
    grid.get(pixel.y)!.set(pixel.x, pixel.color);
  });

  for (let y = 0; y < height; y++) {
    const row = grid.get(y);
    if (!row) continue;

    let x = 0;
    while (x < width) {
      const currentColor = row.get(x);
      if (!currentColor) {
        x++;
        continue;
      }

      let runWidth = 1;
      while (x + runWidth < width && row.get(x + runWidth) === currentColor) {
        runWidth++;
      }

      let runHeight = 1;
      let canExtend = true;

      while (canExtend && y + runHeight < height) {
        const nextRow = grid.get(y + runHeight);
        if (!nextRow) break;

        for (let i = 0; i < runWidth; i++) {
          if (nextRow.get(x + i) !== currentColor) {
            canExtend = false;
            break;
          }
        }
        if (canExtend) runHeight++;
      }

      rectangles.push({
        x,
        y,
        width: runWidth,
        height: runHeight,
        color: currentColor
      });

      x += runWidth;
    }
  }

  postMessage({ pixelData, rectangles });
});
