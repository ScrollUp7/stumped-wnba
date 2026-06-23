export default function Archive({ puzzles, completedIds, onSelect, onBack }) {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <button className="back-btn" onClick={onBack}>
        ← Today's puzzle
      </button>
      <h2 className="archive-title">Puzzle Archive</h2>
      <p className="archive-sub">
        Past puzzles you can play anytime — more added each week during the
        season.
      </p>
      <div className="archive-list">
        {puzzles.map((p) => {
          const played = completedIds.includes(p.id);
          return (
            <button
              key={p.id}
              className={`archive-row${played ? " played" : ""}`}
              onClick={() => !played && onSelect(p.id)}
            >
              <div className="archive-row-left">
                <span className="archive-num">#{p.number}</span>
                <span className="archive-row-title">{p.title}</span>
              </div>
              <div className="archive-row-right">
                <span className="archive-date">{p.id}</span>
                {played && <span className="archive-done">✓</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
