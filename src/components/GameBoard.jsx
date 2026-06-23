import { useState, useCallback } from "react";
import config from "../config.js";

const MISTAKES_MAX = 4;

const DIFF_COLORS = {
  1: config.colors.group1,
  2: config.colors.group2,
  3: config.colors.group3,
  4: config.colors.group4,
};

const DIFF_LABELS = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
  4: "Hardest",
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildTiles(puzzle) {
  const tiles = [];
  puzzle.groups.forEach((g, gi) => {
    g.items.forEach((item) =>
      tiles.push({ text: item, groupIndex: gi, id: `${gi}-${item}` })
    );
  });
  return shuffle(tiles);
}

export default function GameBoard({ puzzle, onComplete }) {
  const [tiles, setTiles] = useState(() => buildTiles(puzzle));
  const [selected, setSelected] = useState([]);
  const [solved, setSolved] = useState([]);
  const [solveOrder, setSolveOrder] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [shakeIds, setShakeIds] = useState([]);
  const [correctIds, setCorrectIds] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [oneAway, setOneAway] = useState(false);
  const [lost, setLost] = useState(false);
  const [locked, setLocked] = useState(false); // prevents input during animations

  // Hint system
  const [hintUsed, setHintUsed] = useState(false);
  const [activeHint, setActiveHint] = useState(null);
  const [hintedTileId, setHintedTileId] = useState(null);

  const remaining = tiles.filter((t) => !solved.includes(t.groupIndex));

  const getEasiestUnsolved = () => {
    const unsolved = puzzle.groups
      .map((g, i) => ({ ...g, index: i }))
      .filter((g) => !solved.includes(g.index))
      .sort((a, b) => a.difficulty - b.difficulty);
    return unsolved[0] || null;
  };

  const handleHint = () => {
    if (hintUsed || gameOver || locked) return;
    const easiest = getEasiestUnsolved();
    if (!easiest) return;

    setHintUsed(true);

    if (easiest.hint) {
      setActiveHint(easiest.hint);
    } else {
      const groupTiles = remaining.filter((t) => t.groupIndex === easiest.index);
      if (groupTiles.length > 0) {
        const randomTile = groupTiles[Math.floor(Math.random() * groupTiles.length)];
        setHintedTileId(randomTile.id);
        setActiveHint("Look at the highlighted tile — it belongs to the easiest remaining group.");
      }
    }
  };

  const handleSelect = useCallback(
    (tile) => {
      if (gameOver || locked) return;
      setOneAway(false);
      setSelected((prev) => {
        if (prev.find((s) => s.id === tile.id))
          return prev.filter((s) => s.id !== tile.id);
        if (prev.length >= 4) return prev;
        return [...prev, tile];
      });
    },
    [gameOver, locked]
  );

  const handleSubmit = useCallback(() => {
    if (selected.length !== 4 || gameOver || locked) return;
    const gis = selected.map((s) => s.groupIndex);
    const allSame = gis.every((g) => g === gis[0]);

    if (allSame) {
      const gi = gis[0];
      setLocked(true);

      // Phase 1: Show correct animation on selected tiles (hold for a beat)
      setCorrectIds(selected.map((s) => s.id));

      // Clear hint highlight if applicable
      if (hintedTileId && selected.find((s) => s.id === hintedTileId)) {
        setHintedTileId(null);
      }

      // Phase 2: After the "correct" pulse, collapse into solved group
      setTimeout(() => {
        setCorrectIds([]);
        setSolved((prev) => [...prev, gi]);
        const newOrder = [...solveOrder, gi];
        setSolveOrder(newOrder);
        setSelected([]);
        setLocked(false);

        if (solved.length + 1 === 4) {
          setGameOver(true);
          setTimeout(() => onComplete?.(true, mistakes, newOrder), 600);
        }
      }, 750);
    } else {
      const counts = {};
      gis.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
      const maxMatch = Math.max(...Object.values(counts));

      setLocked(true);
      setShakeIds(selected.map((s) => s.id));
      if (maxMatch === 3) setOneAway(true);

      const next = mistakes + 1;
      setMistakes(next);
      if (next >= MISTAKES_MAX) {
        setTimeout(() => {
          setShakeIds([]);
          setSelected([]);
          setGameOver(true);
          setRevealAll(true);
          setLost(true);
          setActiveHint(null);
          setLocked(false);
        }, 700);
      } else {
        setTimeout(() => {
          setShakeIds([]);
          setSelected([]);
          setLocked(false);
        }, 550);
      }
    }
  }, [selected, gameOver, locked, solved, mistakes, onComplete, solveOrder, hintedTileId]);

  const handleContinueAfterLoss = () => {
    onComplete?.(false, mistakes, solveOrder);
  };

  return (
    <div>
      {/* Difficulty legend — always visible during play */}
      {!gameOver && (
        <div className="diff-legend">
          {[1, 2, 3, 4].map((d) => (
            <div key={d} className="diff-legend-item">
              <div className="diff-legend-dot" style={{ background: DIFF_COLORS[d] }} />
              <span>{DIFF_LABELS[d]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Solved groups */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: solved.length ? 6 : 0,
        }}
      >
        {solved.map((gi) => {
          const g = puzzle.groups[gi];
          return (
            <div
              key={gi}
              className="solved-group"
              style={{ background: DIFF_COLORS[g.difficulty] }}
            >
              <div className="group-difficulty-tag">{DIFF_LABELS[g.difficulty]}</div>
              <div className="group-label">{g.label}</div>
              <div className="group-items">{g.items.join("  ·  ")}</div>
            </div>
          );
        })}
      </div>

      {/* One away toast */}
      {oneAway && <div className="one-away">One away!</div>}

      {/* Hint display */}
      {activeHint && !revealAll && (
        <div className="hint-toast">
          <span className="hint-icon">💡</span> {activeHint}
        </div>
      )}

      {/* Tile grid */}
      {!revealAll && (
        <div className="tile-grid">
          {remaining.map((tile) => {
            const isSel = !!selected.find((s) => s.id === tile.id);
            const isShake = shakeIds.includes(tile.id);
            const isCorrect = correctIds.includes(tile.id);
            const isHinted = tile.id === hintedTileId;
            return (
              <button
                key={tile.id}
                onClick={() => handleSelect(tile)}
                className={`tile${isSel ? " selected" : ""}${isShake ? " shake" : ""}${isCorrect ? " correct" : ""}${isHinted ? " hinted" : ""}`}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Reveal on loss */}
      {revealAll && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {puzzle.groups
            .filter((_, i) => !solved.includes(i))
            .map((g, i) => (
              <div
                key={i}
                className="solved-group"
                style={{
                  background: DIFF_COLORS[g.difficulty],
                  opacity: 0.75,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <div className="group-difficulty-tag">{DIFF_LABELS[g.difficulty]}</div>
                <div className="group-label">{g.label}</div>
                <div className="group-items">{g.items.join("  ·  ")}</div>
              </div>
            ))}
        </div>
      )}

      {/* Loss state */}
      {lost && (
        <div style={{ textAlign: "center", marginTop: 20, animation: "fadeIn 0.5s ease-out" }}>
          <div style={{
            fontFamily: "var(--f-display)", fontWeight: 800,
            fontSize: 18, color: "var(--accent)", marginBottom: 6,
          }}>
            Stumped!
          </div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 12,
            color: "var(--text-mid)", marginBottom: 16,
          }}>
            Here's what you were looking for
          </div>
          <button className="ctrl-btn submit" onClick={handleContinueAfterLoss}>
            View Results
          </button>
        </div>
      )}

      {/* Mistakes */}
      <div className="mistakes-row">
        <span>Mistakes</span>
        {Array.from({ length: MISTAKES_MAX }).map((_, i) => (
          <div key={i} className={`dot${i < mistakes ? " filled" : ""}`} />
        ))}
      </div>

      {/* Controls */}
      {!gameOver && (
        <div className="controls">
          <button
            className="ctrl-btn"
            onClick={() => setTiles((prev) => shuffle(prev))}
            disabled={locked}
          >
            Shuffle
          </button>
          <button
            className="ctrl-btn"
            onClick={() => setSelected([])}
            disabled={!selected.length || locked}
          >
            Deselect
          </button>
          <button
            className="ctrl-btn hint"
            onClick={handleHint}
            disabled={hintUsed || locked}
          >
            {hintUsed ? "Hint used" : "Hint"}
          </button>
          <button
            className="ctrl-btn submit"
            onClick={handleSubmit}
            disabled={selected.length !== 4 || locked}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
