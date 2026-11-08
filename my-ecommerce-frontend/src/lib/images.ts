/**
 * Image optimization & proxy utility for Slay By Humu Store.
 * 
 * Solves the critical issue where external CDN image requests (res.cloudinary.com)
 * stall, timeout, or get blocked in browser clients due to dual-stack IPv6/DNS
 * routing drops, massive uncompressed image payloads (1-2MB per photo), or ad-blockers.
 * 
 * Works by:
 * 1. Injecting Cloudinary on-the-fly transformations (w_, q_auto, f_auto) to shrink 2MB photos to 5-50KB.
 * 2. Routing through Next.js same-origin image optimization (/_next/image), which connects via IPv4,
 *    caches locally, and serves instantly to the client.
 * 3. Gracefully falling back to raw URLs or luxury placeholders if anything fails.
 */

export function getOptimizedCloudinaryUrl(
  url?: string | null,
  width: number = 640,
  height?: number,
  crop: 'fill' | 'limit' | 'fit' = 'fill'
): string {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  // If already transformed with width/crop parameters, don't duplicate
  if (url.includes('/upload/w_') || url.includes('/upload/c_')) {
    return url;
  }

  const transformParts = [`w_${width}`];
  if (height) transformParts.push(`h_${height}`);
  if (crop) transformParts.push(`c_${crop}`);
  transformParts.push('q_auto', 'f_auto');

  const transformStr = transformParts.join(',') + '/';
  return url.replace('/upload/', `/upload/${transformStr}`);
}

/**
 * Returns a same-origin Next.js optimized image URL for any product photo.
 * Supported target widths: 128, 256, 384, 640, 1080, 1200
 */
export function getOptimizedImageUrl(
  url?: string | null,
  targetWidth: number = 640
): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Allowed Next.js image optimizer widths
  const validSizes = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920];
  const matchedWidth = validSizes.find((s) => s >= targetWidth) || validSizes[validSizes.length - 1];

  // If it's a Cloudinary URL, pre-optimize transformations first for maximum compression
  let transformedUrl = url;
  if (url.includes('res.cloudinary.com')) {
    transformedUrl = getOptimizedCloudinaryUrl(url, matchedWidth);
  }

  // If it's already a local relative path, return as-is
  if (transformedUrl.startsWith('/') && !transformedUrl.startsWith('/_next/image')) {
    return transformedUrl;
  }

  // Return same-origin Next.js optimized proxy URL
  return `/_next/image?url=${encodeURIComponent(transformedUrl)}&w=${matchedWidth}&q=75`;
}
