// ════════════════════════════════════════════════════════════════
// SITE CONFIGURATION
// Change this file to create NFL or Golf versions.
// Everything league-specific lives here.
// ════════════════════════════════════════════════════════════════

const config = {
  // Identity
  league: "WNBA",
  siteName: "Courtside Connections",
  tagline: "The daily WNBA puzzle",
  description:
    "Test your WNBA knowledge. Find four groups of four. A new puzzle every day during the season — plus an archive of past puzzles year-round.",
  domain: "courtsideconnections.com",

  // Colors — group difficulty (1=easiest, 4=hardest)
  colors: {
    accent: "#E8453C",
    accentGlow: "rgba(232,69,60,0.2)",
    group1: "#4A90D9", // Easy
    group2: "#5BA85A", // Medium
    group3: "#D4880F", // Hard
    group4: "#E8453C", // Hardest
  },

  // Social
  social: {
    twitter: "",
    hashtag: "#CourtsideConnections",
  },

  // SEO
  seo: {
    title: "Courtside Connections — The Daily WNBA Puzzle",
    ogImage: "", // URL to og:image once created
  },
};

export default config;
