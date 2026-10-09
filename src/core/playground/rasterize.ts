/**
 * Paint a DOM element to a PNG without leaving the page: serialise it into an SVG <foreignObject>, draw
 * that onto a canvas, read it back. The element must carry its own styles (inline or a <style> inside it),
 * because an SVG image cannot see the page's stylesheets or web fonts.
 */
export async function rasterizeElement(el: HTMLElement, scale = 2): Promise<File> {
  const { width, height } = el.getBoundingClientRect();
  const w = Math.max(1, Math.ceil(width));
  const h = Math.max(1, Math.ceil(height));
  const xhtml = new XMLSerializer().serializeToString(el);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<foreignObject width="100%" height="100%">${xhtml}</foreignObject></svg>`;

  const img = new Image();
  const loaded = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not render the component to an image'));
  });
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await loaded;

  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) throw new Error('Could not encode the rendered image');
  return new File([blob], 'component.png', { type: 'image/png' });
}
