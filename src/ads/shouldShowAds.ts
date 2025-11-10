// Utility: Only show ads on guide pages, not tool pages
export function shouldShowAds(route: string) {
  return /^\/(image-to-text|extract-text-from-image|copy-text-from-image|jpg-to-word|jpg-to-excel)$/.test(route);
}
