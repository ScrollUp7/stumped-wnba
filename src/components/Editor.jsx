import { useState, useRef } from "react";

const DIFF_COLORS = { 1: "#4A90D9", 2: "#5BA85A", 3: "#D4880F", 4: "#E8453C" };
const DIFF_LABELS = { 1: "Easy", 2: "Medium", 3: "Hard", 4: "Hardest" };
const CONF_COLORS = { high: "#5BA85A", medium: "#D4880F", low: "#E8453C" };

export default function Editor() {
  // Auth
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  // Input
  const [research, setResearch] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [fileType, setFileType] = useState("");
  const fileRef = useRef(null);

  // Processing
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState(null);
  const [overlaps, setOverlaps] = useState({});

  // Puzzle assembly
  const [puzzleTitle, setPuzzleTitle] = useState("");
  const [puzzleDate, setPuzzleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [puzzleNumber, setPuzzleNumber] = useState(1);
  const [exported, setExported] = useState(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState("input");

  // ── File handling ──
  function handleFile(file) {
    if (!file) return;
    setError(null);
    setStatusMsg("Reading file...");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const b64 = reader.result.split(",")[1];
        setFileBase64(b64);
        setFileName(file.name);
        setFileType(file.type || "application/pdf");
        setResearch("");
        setStatusMsg("File loaded: " + file.name);
      } catch (e) {
        setError("Failed to read file: " + e.message);
        setStatusMsg("");
      }
    };
    reader.onerror = () => {
      setError("File read error");
      setStatusMsg("");
    };
    reader.readAsDataURL(file);
  }

  function clearFile() {
    setFileBase64("");
    setFileName("");
    setFileType("");
    setStatusMsg("");
    if (fileRef.current) fileRef.current.value = "";
  }

  // ── Overlap detection ──
  function detectOverlaps(cats) {
    const map = {};
    cats.forEach((cat, i) => {
      cat.items.forEach((item) => {
        const k = item.toLowerCase().trim();
        if (!map[k]) map[k] = [];
        map[k].push(i);
      });
    });
    const conflicts = {};
    Object.entries(map).forEach(([item, indices]) => {
      if (indices.length > 1) conflicts[item] = indices;
    });
    setOverlaps(conflicts);
  }

  function getSelectedOverlaps() {
    const cats = selected.map((i) => candidates[i]);
    const seen = {};
    const conflicts = [];
    cats.forEach((cat, ci) => {
      cat.items.forEach((item) => {
        const k = item.toLowerCase().trim();
        if (seen[k] !== undefined)
          conflicts.push({ item, cat1: seen[k], cat2: ci });
        else seen[k] = ci;
      });
    });
    return conflicts;
  }

  // ── API call (goes through serverless function) ──
  async function processResearch() {
    if (!research.trim() && !fileBase64) {
      setError("Upload a file or paste research text first");
      return;
    }
    setLoading(true);
    setError(null);
    setStatusMsg("Processing research...");

    try {
      const body = { password };
      if (fileBase64) {
        body.fileBase64 = fileBase64;
        body.fileType = fileType;
        setStatusMsg("Processing PDF — reading tables and stats...");
      } else {
        body.text = research;
        setStatusMsg("Processing text — extracting categories...");
      }

      const resp = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "API error " + resp.status);
      }

      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error("Invalid response format");
      }

      setCandidates(data.categories);
      detectOverlaps(data.categories);
      setSelected([]);
      setView("review");
      setStatusMsg("");
    } catch (err) {
      console.error("Process error:", err);
      setError(err.message);
      setStatusMsg("");
    } finally {
      setLoading(false);
    }
  }

  // ── Selection ──
  function toggleSelect(index) {
    setSelected((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= 4) return prev;
      return [...prev, index];
    });
  }

  // ── Export ──
  function buildExport() {
    const puzzle = {
      id: puzzleDate,
      number: puzzleNumber,
      title: puzzleTitle || "Untitled",
      season: new Date().getFullYear().toString(),
      groups: selected.map((i) => {
        const cat = candidates[i];
        return {
          label: cat.label,
          difficulty: cat.difficulty,
          hint: cat.hint,
          items: cat.items,
        };
      }),
    };
    setExported(puzzle);
    setView("export");
  }

  const hasInput = research.trim().length > 0 || fileBase64.length > 0;

  // ── PASSWORD GATE ──
  if (!authed) {
    return (
      <div className="ed-app">
        <div className="ed-mx">
          <div className="ed-bar" />
          <div className="ed-hd">Stumped Editor</div>
          <div className="ed-sub">Enter your editor password to continue</div>
          <div style={{ maxWidth: 320 }}>
            <input
              className="ed-inp"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setAuthed(true);
              }}
            />
            {authError && <div className="ed-err">{authError}</div>}
            <div className="ed-btnr">
              <button
                className="ed-btn p"
                onClick={() => setAuthed(true)}
                disabled={!password}
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN EDITOR ──
  return (
    <div className="ed-app">
      <div className="ed-mx">
        <div className="ed-bar" />
        <div className="ed-hd">Stumped Editor</div>
        <div className="ed-sub">
          Upload research → extract categories → assemble puzzle → export
        </div>

        {/* Steps */}
        <div className="ed-steps">
          {["Upload", "Review", "Assemble", "Export"].map((s, i) => {
            const vi = ["input", "review", "assemble", "export"].indexOf(view);
            return (
              <div
                key={s}
                className={`ed-step${i === vi ? " on" : ""}${i < vi ? " ok" : ""}`}
              >
                {i < vi ? "✓ " : ""}
                {s}
              </div>
            );
          })}
        </div>

        {/* ═══ INPUT ═══ */}
        {view === "input" && (
          <div>
            <div
              className={`ed-drop${fileName ? " has" : ""}`}
              onClick={() => !fileName && fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "var(--border)";
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFile(e.target.files?.[0])}
                style={{ display: "none" }}
              />
              {fileName ? (
                <div className="ed-file-row">
                  <div className="ed-file-info">
                    <span style={{ fontSize: 24 }}>📄</span>
                    <div>
                      <div className="ed-file-name">{fileName}</div>
                      <div className="ed-file-status">Ready to process</div>
                    </div>
                  </div>
                  <button
                    className="ed-btn sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  <div className="ed-drop-title">
                    Drop your research file here or click to browse
                  </div>
                  <div className="ed-drop-sub">
                    PDF, DOCX, or TXT — tables and formatting preserved
                  </div>
                </>
              )}
            </div>

            {!fileName && (
              <>
                <div className="ed-divider">
                  <div className="ed-divider-line" />
                  or paste text
                  <div className="ed-divider-line" />
                </div>
                <textarea
                  className="ed-ta"
                  placeholder="Paste research text here..."
                  value={research}
                  onChange={(e) => setResearch(e.target.value)}
                />
              </>
            )}

            {error && <div className="ed-err">{error}</div>}
            {statusMsg && !error && (
              <div className="ed-status">{statusMsg}</div>
            )}

            <div className="ed-btnr">
              <button
                className="ed-btn p"
                onClick={processResearch}
                disabled={!hasInput || loading}
              >
                {loading ? "Processing..." : "Extract Categories"}
              </button>
            </div>

            {loading && (
              <div className="ed-loading">
                <div className="ed-spinner" />
                <div>{statusMsg || "Processing..."}</div>
              </div>
            )}
          </div>
        )}

        {/* ═══ REVIEW ═══ */}
        {view === "review" && (
          <div>
            <div className="ed-count">
              Found <span>{candidates.length}</span> category candidates
            </div>

            {Object.keys(overlaps).length > 0 && (
              <div className="ed-warn">
                <strong>Overlap detected:</strong>{" "}
                {Object.entries(overlaps).map(([item, indices]) => (
                  <span key={item}>
                    "{item}" in #
                    {indices.map((i) => i + 1).join(" & #")}.{" "}
                  </span>
                ))}
              </div>
            )}

            <div className="ed-slbl">
              Select 4 categories ({selected.length}/4)
            </div>
            <div className="ed-legend">
              <span style={{ color: "#D4880F" }}>Orange border</span> = item
              overlaps with another category.{" "}
              <span style={{ color: "#5BA85A" }}>Green border</span> = selected.
            </div>

            {candidates.map((cat, i) => {
              const isSel = selected.includes(i);
              const hasOlap = cat.items.some(
                (item) => overlaps[item.toLowerCase().trim()]
              );
              return (
                <div
                  key={i}
                  className={`ed-cc${isSel ? " sel" : ""}${hasOlap ? " olap" : ""}`}
                  onClick={() => toggleSelect(i)}
                >
                  <div className="ed-csel">{isSel ? "✓" : ""}</div>
                  <div className="ed-clab">{cat.label}</div>
                  <div className="ed-citems">
                    {cat.items.map((item, j) => (
                      <span
                        key={j}
                        className={`ed-ci${overlaps[item.toLowerCase().trim()] ? " bad" : ""}`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="ed-chint">💡 {cat.hint}</div>
                  <div className="ed-cmeta">
                    <span className="ed-meta-label">Difficulty:</span>
                    <span
                      className="ed-badge"
                      style={{
                        background: DIFF_COLORS[cat.difficulty] + "22",
                        color: DIFF_COLORS[cat.difficulty],
                      }}
                    >
                      {DIFF_LABELS[cat.difficulty]}
                    </span>
                    <span className="ed-meta-label" style={{ marginLeft: 8 }}>
                      Confidence:
                    </span>
                    <span
                      className="ed-badge"
                      style={{
                        background: CONF_COLORS[cat.confidence] + "22",
                        color: CONF_COLORS[cat.confidence],
                      }}
                    >
                      {cat.confidence}
                    </span>
                  </div>
                  {cat.source && (
                    <div className="ed-csrc">Source: {cat.source}</div>
                  )}
                </div>
              );
            })}

            <div className="ed-btnr">
              <button className="ed-btn" onClick={() => setView("input")}>
                ← Back
              </button>
              <button className="ed-btn" onClick={() => setSelected([])}>
                Clear
              </button>
              <button
                className="ed-btn p"
                onClick={() => setView("assemble")}
                disabled={selected.length !== 4}
              >
                Assemble ({selected.length}/4)
              </button>
            </div>
          </div>
        )}

        {/* ═══ ASSEMBLE ═══ */}
        {view === "assemble" && (
          <div>
            <div className="ed-slbl">Puzzle Details</div>

            {getSelectedOverlaps().length > 0 && (
              <div className="ed-warn">
                <strong>Overlap!</strong>{" "}
                {getSelectedOverlaps().map((c, i) => (
                  <span key={i}>"{c.item}" in two categories. </span>
                ))}{" "}
                Go back and fix.
              </div>
            )}

            <div className="ed-fld">
              <div className="ed-flbl">Puzzle Title</div>
              <input
                className="ed-inp"
                placeholder="e.g., Titles, Turnovers & the .500 Line"
                value={puzzleTitle}
                onChange={(e) => setPuzzleTitle(e.target.value)}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="ed-fld">
                <div className="ed-flbl">Date</div>
                <input
                  className="ed-inp"
                  type="date"
                  value={puzzleDate}
                  onChange={(e) => setPuzzleDate(e.target.value)}
                />
              </div>
              <div className="ed-fld">
                <div className="ed-flbl">Number</div>
                <input
                  className="ed-inp"
                  type="number"
                  value={puzzleNumber}
                  onChange={(e) =>
                    setPuzzleNumber(parseInt(e.target.value) || 1)
                  }
                />
              </div>
            </div>

            <div className="ed-slbl" style={{ marginTop: 16 }}>
              Selected Categories
            </div>
            {selected.map((idx) => {
              const cat = candidates[idx];
              return (
                <div
                  key={idx}
                  className="ed-cc"
                  style={{
                    cursor: "default",
                    borderLeftColor: DIFF_COLORS[cat.difficulty],
                    borderLeftWidth: 4,
                  }}
                >
                  <div className="ed-clab">{cat.label}</div>
                  <div className="ed-citems">
                    {cat.items.map((item, j) => (
                      <span key={j} className="ed-ci">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="ed-chint">💡 {cat.hint}</div>
                </div>
              );
            })}

            <div className="ed-btnr">
              <button className="ed-btn" onClick={() => setView("review")}>
                ← Back
              </button>
              <button
                className="ed-btn p"
                onClick={buildExport}
                disabled={
                  !puzzleTitle.trim() || getSelectedOverlaps().length > 0
                }
              >
                Export
              </button>
            </div>
          </div>
        )}

        {/* ═══ EXPORT ═══ */}
        {view === "export" && exported && (
          <div>
            <div className="ed-slbl">Puzzle Ready</div>
            <p className="ed-export-desc">
              Copy this JSON into{" "}
              <code style={{ color: "var(--accent)" }}>
                src/data/puzzles.json
              </code>
              , then push to GitHub.
            </p>
            <pre className="ed-pre">
              {JSON.stringify(exported, null, 2)}
            </pre>
            <div className="ed-btnr">
              <button className="ed-btn" onClick={() => setView("assemble")}>
                ← Back
              </button>
              <button
                className="ed-btn p"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(exported, null, 2)
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied!" : "Copy JSON"}
              </button>
              <button
                className="ed-btn"
                onClick={() => {
                  setCandidates([]);
                  setSelected([]);
                  setExported(null);
                  setPuzzleTitle("");
                  setResearch("");
                  clearFile();
                  setView("input");
                }}
              >
                New Research
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
