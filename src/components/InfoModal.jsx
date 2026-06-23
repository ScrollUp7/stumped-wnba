import config from "../config.js";

export default function InfoModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h3 className="modal-title">How to Play</h3>
        <div className="modal-body">
          <p>
            Find four groups of four {config.league} items that share something
            in common — a record, a stat, a franchise history, or a league
            milestone.
          </p>
          <p>
            Select four tiles and tap <strong>Submit</strong> to check your
            guess. You get four mistakes before the game ends.
          </p>
          <div className="difficulty-key">
            <h4>Difficulty</h4>
            <div className="diff-row">
              <div
                className="diff-dot"
                style={{ background: config.colors.group1 }}
              />{" "}
              Easy
            </div>
            <div className="diff-row">
              <div
                className="diff-dot"
                style={{ background: config.colors.group2 }}
              />{" "}
              Medium
            </div>
            <div className="diff-row">
              <div
                className="diff-dot"
                style={{ background: config.colors.group3 }}
              />{" "}
              Hard
            </div>
            <div className="diff-row">
              <div
                className="diff-dot"
                style={{ background: config.colors.group4 }}
              />{" "}
              Hardest
            </div>
          </div>
          <p className="modal-note">
            A new puzzle drops every day during the {config.league} season.
            Off-season? Play the archive.
          </p>
        </div>
      </div>
    </div>
  );
}
