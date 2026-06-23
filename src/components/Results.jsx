import { useState } from "react";
import { generateSimpleShareText, shareResults } from "../utils/share.js";

export default function Results({
  puzzle,
  won,
  mistakes,
  solveOrder,
  stats,
  onPlayArchive,
}) {
  const [shareState, setShareState] = useState(null); // null | "copied" | "shared"

  const handleShare = async () => {
    const text = generateSimpleShareText(puzzle, solveOrder, mistakes);
    const result = await shareResults(text);
    setShareState(result);
    if (result === "copied") {
      setTimeout(() => setShareState(null), 2500);
    }
  };

  const winPct = stats.played
    ? Math.round((stats.won / stats.played) * 100)
    : 0;

  return (
    <div className="results">
      <div className="results-header">
        {won
          ? mistakes === 0
            ? "Perfect."
            : mistakes === 1
              ? "So close to perfect."
              : "Solved."
          : "Stumped!"}
      </div>
      <div className="results-sub">
        {won
          ? `${mistakes} mistake${mistakes !== 1 ? "s" : ""}`
          : `${4 - (solveOrder?.length || 0)} of 4 groups found`}
      </div>

      <div className="stats-row">
        <div className="stat">
          <div className="stat-num">{stats.played}</div>
          <div className="stat-label">Played</div>
        </div>
        <div className="stat">
          <div className="stat-num">{winPct}%</div>
          <div className="stat-label">Win rate</div>
        </div>
        <div className="stat">
          <div className="stat-num">{stats.streak}</div>
          <div className="stat-label">Streak</div>
        </div>
        <div className="stat">
          <div className="stat-num">{stats.maxStreak}</div>
          <div className="stat-label">Best</div>
        </div>
      </div>

      <button className="share-btn" onClick={handleShare}>
        {shareState === "copied"
          ? "Copied!"
          : shareState === "shared"
            ? "Shared!"
            : won
              ? "Share Results"
              : "Share Anyway"}
      </button>

      <button className="archive-link" onClick={onPlayArchive}>
        {won ? "Play past puzzles →" : "Redeem yourself — play past puzzles →"}
      </button>
    </div>
  );
}
