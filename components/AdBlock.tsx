// Renders a responsive AdSense unit only after consent.
// Reserve height to avoid CLS.
import { useEffect } from "react";

export default function AdBlock({
  slot,
  consent,
  minHeight = 320
}: { slot: string; consent: boolean; minHeight?: number }) {
  useEffect(() => {
    if (!consent) return;
    (window as any).adsbygoogle = (window as any).adsbygoogle || [];
    (window as any).adsbygoogle.push({});
  }, [consent]);

  if (!consent) return <div style={{ minHeight }} />; // reserve space; no layout shift

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", minHeight }}
      data-ad-client="ca-pub-2964937995247458"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
