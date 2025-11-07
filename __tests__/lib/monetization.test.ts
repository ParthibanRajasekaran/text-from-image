import {
  isUtilityRoute,
  hasPublisherContent,
  shouldShowAds,
  getAdPlacementStrategy,
} from '../../lib/monetization';

describe('monetization utilities', () => {
  describe('isUtilityRoute', () => {
    it('should return true for utility routes', () => {
      expect(isUtilityRoute('/404')).toBe(true);
      expect(isUtilityRoute('/500')).toBe(true);
      expect(isUtilityRoute('/login')).toBe(true);
      expect(isUtilityRoute('/auth/callback')).toBe(true);
    });

    it('should return false for content routes', () => {
      expect(isUtilityRoute('/')).toBe(false);
      expect(isUtilityRoute('/extract')).toBe(false);
      expect(isUtilityRoute('/receipt-ocr')).toBe(false);
    });

    it('should handle invalid paths safely', () => {
      expect(isUtilityRoute('')).toBe(true);
      expect(isUtilityRoute(null as any)).toBe(true);
    });
  });

  describe('hasPublisherContent', () => {
    it('should return true when word count >= 250', () => {
      expect(hasPublisherContent({ wordCount: 250, hasResult: false, hasExplainers: false })).toBe(true);
      expect(hasPublisherContent({ wordCount: 500, hasResult: false, hasExplainers: false })).toBe(true);
    });

    it('should return true when hasResult is true', () => {
      expect(hasPublisherContent({ wordCount: 50, hasResult: true, hasExplainers: false })).toBe(true);
    });

    it('should return true when hasExplainers is true', () => {
      expect(hasPublisherContent({ wordCount: 100, hasResult: false, hasExplainers: true })).toBe(true);
    });

    it('should return false when no content criteria met', () => {
      expect(hasPublisherContent({ wordCount: 100, hasResult: false, hasExplainers: false })).toBe(false);
    });
  });

  describe('shouldShowAds', () => {
    it('should return false on utility routes regardless of content', () => {
      expect(shouldShowAds('/404', { wordCount: 500, hasResult: true, hasExplainers: true })).toBe(false);
    });

    it('should return true on content routes with sufficient content', () => {
      expect(shouldShowAds('/', { wordCount: 300, hasResult: false, hasExplainers: false })).toBe(true);
    });

    it('should return false on content routes without sufficient content', () => {
      expect(shouldShowAds('/', { wordCount: 50, hasResult: false, hasExplainers: false })).toBe(false);
    });
  });

  describe('getAdPlacementStrategy', () => {
    it('should return 1 ad slot for short content', () => {
      const strategy = getAdPlacementStrategy({ wordCount: 300, hasResult: false, hasExplainers: false });
      expect(strategy.maxAdSlots).toBe(1);
    });

    it('should return 2 ad slots for medium content', () => {
      const strategy = getAdPlacementStrategy({ wordCount: 500, hasResult: true, hasExplainers: false });
      expect(strategy.maxAdSlots).toBe(2);
    });

    it('should return 3 ad slots for long content', () => {
      const strategy = getAdPlacementStrategy({ wordCount: 800, hasResult: false, hasExplainers: true });
      expect(strategy.maxAdSlots).toBe(3);
    });
  });
});
