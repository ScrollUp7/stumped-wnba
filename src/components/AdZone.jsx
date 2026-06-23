// ════════════════════════════════════════════════════════════════
// AD ZONE
// In production, replace the placeholder div with your actual
// ad network code (Ezoic, AdSense, or Publisher Collective).
//
// Example for AdSense:
//   <ins className="adsbygoogle"
//     style={{ display: "block" }}
//     data-ad-client="ca-pub-XXXXXXXXXX"
//     data-ad-slot="XXXXXXXXXX"
//     data-ad-format="auto"
//     data-full-width-responsive="true" />
//
// Example for Ezoic:
//   <div id="ezoic-pub-ad-placeholder-101"></div>
// ════════════════════════════════════════════════════════════════

export default function AdZone({ placement, style }) {
  // In development, show a labeled placeholder.
  // In production, this is where the ad script renders.
  return (
    <div className="ad-zone" style={style}>
      AD — {placement}
    </div>
  );
}
