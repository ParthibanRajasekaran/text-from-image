import React from 'react';

export type AdSlotSize = 'leaderboard' | 'rectangle' | 'skyscraper' | 'mobile-banner';

interface AdSlotProps {
  slot: AdSlotSize;
  className?: string;
}

/**
 * Reserved ad slot container with zero CLS
 * 
 * Sizes:
 * - leaderboard: 728x90 (desktop) / 320x50 (mobile)
 * - rectangle: 300x250
 * - skyscraper: 160x600
 * - mobile-banner: 320x100
 * 
 * Features:
 * - Reserved space prevents layout shift
 * - Glass-morphism placeholder
 * - Responsive sizing
 * - ARIA labels for screen readers
 */
export function AdSlot({ slot, className = '' }: AdSlotProps) {
  const dimensions = {
    leaderboard: {
      desktop: { width: 728, height: 90 },
      mobile: { width: 320, height: 50 },
    },
    rectangle: {
      desktop: { width: 300, height: 250 },
      mobile: { width: 300, height: 250 },
    },
    skyscraper: {
      desktop: { width: 160, height: 600 },
      mobile: { width: 160, height: 600 },
    },
    'mobile-banner': {
      desktop: { width: 320, height: 100 },
      mobile: { width: 320, height: 100 },
    },
  };

  const size = dimensions[slot];
  const isLeaderboard = slot === 'leaderboard';

  return (
    <div
      className={`ad-slot-container flex items-center justify-center ${className}`}
      style={{
        minWidth: isLeaderboard ? `${size.mobile.width}px` : `${size.desktop.width}px`,
        minHeight: isLeaderboard ? `${size.mobile.height}px` : `${size.desktop.height}px`,
        width: '100%',
        maxWidth: `${size.desktop.width}px`,
      }}
      role="complementary"
      aria-label="Advertisement"
    >
      <div
        className="w-full h-full rounded-lg border border-border/30 bg-surface/20 backdrop-blur-sm flex items-center justify-center"
        style={{
          minHeight: isLeaderboard
            ? `${size.mobile.height}px`
            : `${size.desktop.height}px`,
        }}
      >
        {/* Placeholder content */}
        <div className="text-center px-4">
          <p className="text-xs text-muted-foreground/50 font-medium">
            Advertisement
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Ad slot positioned between content sections
 */
export function InlineAdSlot({ slot = 'rectangle', className = '' }: { slot?: AdSlotSize; className?: string }) {
  return (
    <div className={`my-8 sm:my-12 flex justify-center ${className}`}>
      <AdSlot slot={slot} />
    </div>
  );
}

/**
 * Sticky sidebar ad slot
 */
export function SidebarAdSlot({ className = '' }: { className?: string }) {
  return (
    <aside className={`hidden lg:block sticky top-24 ${className}`}>
      <AdSlot slot="skyscraper" />
    </aside>
  );
}

/**
 * Top banner ad slot (leaderboard)
 */
export function TopBannerAdSlot({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full flex justify-center py-4 border-b border-border/30 ${className}`}>
      <AdSlot slot="leaderboard" />
    </div>
  );
}
