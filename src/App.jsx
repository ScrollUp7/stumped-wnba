import { useState, useCallback, useEffect } from "react";
import config from "./config.js";
import puzzlesData from "./data/puzzles.json";
import { loadStats, saveStats, loadCompleted, saveCompleted } from "./utils/storage.js";
import GameBoard from "./components/GameBoard.jsx";
import Results from "./components/Results.jsx";
import Archive from "./components/Archive.jsx";
import InfoModal from "./components/InfoModal.jsx";
import AdZone from "./components/AdZone.jsx";
import "./styles/app.css";

// Sort puzzles: newest first by ID (date string)
const PUZZLES = [...puzzlesData].sort((a, b) => b.id.localeCompare(a.id));

export default function App() {
  // ── State ──
  const [view, setView] = useState("game"); // "game" | "archive"
  const [activePuzzleId, setActivePuzzleId] = useState(PUZZLES[0]?.id || null);
  const [completed, setCompleted] = useState(() => loadCompleted());
  const [stats, setStats] = useState(() => loadStats());
  const [showInfo, setShowInfo] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const activePuzzle = PUZZLES.find((p) => p.id === activePuzzleId);
  const isCompleted = activePuzzleId in completed;

  // If today's puzzle was already completed, show results immediately
  useEffect(() => {
    if (isCompleted && completed[activePuzzleId]) {
      setLastResult(completed[activePuzzleId]);
      setShowResults(true);
    }
  }, [activePuzzleId]);

  // ── Game complete handler ──
  const handleComplete = useCallback(
    (won, mistakes, solveOrder) => {
      const result = { won, mistakes, solveOrder };

      // Update completed puzzles
      const newCompleted = { ...completed, [activePuzzleId]: result };
      setCompleted(newCompleted);
      saveCompleted(newCompleted);

      // Update stats
      setStats((prev) => {
        const newStreak = won ? prev.streak + 1 : 0;
        const updated = {
          played: prev.played + 1,
          won: prev.won + (won ? 1 : 0),
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
        };
        saveStats(updated);
        return updated;
      });

      setLastResult(result);
      setTimeout(() => setShowResults(true), 800);
    },
    [activePuzzleId, completed]
  );

  // ── Archive navigation ──
  const handleArchiveSelect = (id) => {
    setActivePuzzleId(id);
    setView("game");
    setShowResults(false);
    setLastResult(null);
  };

  const handleBackToToday = () => {
    setActivePuzzleId(PUZZLES[0]?.id);
    setView("game");
    setShowResults(false);
    setLastResult(null);
  };

  return (
    <div className="app">
      <div className="container">
        {/* ── Top ad ── */}
        <AdZone
          placement="LEADERBOARD 728×90"
          style={{ margin: "12px 0" }}
        />

        {/* ── Header ── */}
        <header className="header">
          <div>
            <div className="logo">{config.siteName}</div>
            <div className="logo-sub">{config.tagline}</div>
          </div>
          <div className="header-actions">
            <button
              className="icon-btn"
              onClick={() => setShowInfo(true)}
              title="How to play"
              aria-label="How to play"
            >
              ?
            </button>
            <button
              className="icon-btn"
              onClick={() =>
                setView(view === "archive" ? "game" : "archive")
              }
              title="Archive"
              aria-label="Puzzle archive"
            >
              ☰
            </button>
          </div>
        </header>
        <div className="header-line" />

        {/* ── GAME VIEW ── */}
        {view === "game" && activePuzzle && (
          <main>
            <div className="puzzle-meta">
              <div className="puzzle-num">
                Puzzle #{activePuzzle.number} · {activePuzzle.season} Season
              </div>
              <div className="puzzle-title">{activePuzzle.title}</div>
            </div>

            {!isCompleted ? (
              <GameBoard
                key={activePuzzleId}
                puzzle={activePuzzle}
                onComplete={handleComplete}
              />
            ) : showResults && lastResult ? (
              <Results
                puzzle={activePuzzle}
                won={lastResult.won}
                mistakes={lastResult.mistakes}
                solveOrder={lastResult.solveOrder || []}
                stats={stats}
                onPlayArchive={() => setView("archive")}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div
                  style={{
                    fontFamily: "var(--f-display)",
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Puzzle complete
                </div>
                <button
                  className="archive-link"
                  onClick={() => setView("archive")}
                >
                  Play past puzzles →
                </button>
              </div>
            )}

            {/* ── Mid-content ad ── */}
            <AdZone
              placement="RECTANGLE 300×250"
              style={{ margin: "24px auto", maxWidth: 300 }}
            />

            {/* ── SEO content block ── */}
            <div className="seo-block">
              <h2>About Today's Puzzle</h2>
              <p>
                Today's {config.siteName} puzzle draws from{" "}
                {activePuzzle.season} {config.league} season research —
                covering records, franchise histories, and player milestones.
                Categories range from expansion team origins to career
                statistical leaders. New puzzles drop daily during the active
                season, with archived puzzles available year-round.
              </p>
              <h3>Did you know?</h3>
              <p>
                The {config.league} has expanded significantly since its
                founding in 1996. Four expansion teams debuted in the 2000
                season alone, and the league has announced plans for additional
                expansion cities through 2030. Test your knowledge of these
                changes and more in today's puzzle.
              </p>
            </div>
          </main>
        )}

        {/* ── ARCHIVE VIEW ── */}
        {view === "archive" && (
          <Archive
            puzzles={PUZZLES}
            completedIds={Object.keys(completed)}
            onSelect={handleArchiveSelect}
            onBack={handleBackToToday}
          />
        )}

        {/* ── Bottom ad ── */}
        <AdZone
          placement="LEADERBOARD 728×90"
          style={{ margin: "24px 0" }}
        />

        {/* ── Footer ── */}
        <footer className="footer">
          <div>
            {config.siteName} — Research-driven {config.league} puzzles
          </div>
          <div style={{ marginTop: 4 }}>© 2026 {config.siteName}</div>
        </footer>
      </div>

      {/* ── Info modal ── */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}
