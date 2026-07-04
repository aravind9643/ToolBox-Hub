import { useEffect, useRef } from 'react';

/**
 * Google AdSense Banner Component
 * 
 * HOW TO USE:
 * 1. Get your AdSense Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
 * 2. Set ADSENSE_ENABLED = true below
 * 3. Replace the data-ad-slot values with your actual ad slot IDs
 * 4. Uncomment the AdSense script in index.html
 * 
 * Ad slot IDs are created in your AdSense dashboard:
 *   → Ads → By ad unit → Create new ad unit
 */

// ⬇️ SET THIS TO true ONCE YOU HAVE YOUR ADSENSE APPROVED ⬇️
const ADSENSE_ENABLED = false;

// ⬇️ REPLACE THESE WITH YOUR ACTUAL AD SLOT IDs FROM ADSENSE DASHBOARD ⬇️
const AD_SLOTS = {
  header: '6876828711',   // Leaderboard (728x90)
  sidebar: '3192734578',  // Medium Rectangle (300x250)
  inline: '1846074877',   // In-feed
  footer: '7625015165',   // Leaderboard (728x90)
};

// ⬇️ REPLACE WITH YOUR PUBLISHER ID ⬇️
const PUBLISHER_ID = 'ca-pub-9316330718026325';

export default function AdBanner({ type = 'header' }) {
  const adRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (ADSENSE_ENABLED && !initialized.current && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initialized.current = true;
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  const className = `ad-banner ad-banner-${type}`;

  // Show placeholder when AdSense is not enabled
  if (!ADSENSE_ENABLED) {
    return (
      <div className={className} id={`ad-${type}`}>
        <span>Ad Space — {type.toUpperCase()}</span>
      </div>
    );
  }

  // Render actual Google AdSense ad unit
  return (
    <div className={className} id={`ad-${type}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: type === 'sidebar' ? '250px' : '90px',
        }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={AD_SLOTS[type] || AD_SLOTS.header}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
