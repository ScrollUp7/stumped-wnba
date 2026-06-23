// ════════════════════════════════════════════════════════════════
// LOCAL STORAGE — Streak and stats persistence
// ════════════════════════════════════════════════════════════════

const STATS_KEY = "cc-stats";
const COMPLETED_KEY = "cc-completed";

const defaultStats = {
  played: 0,
  won: 0,
  streak: 0,
  maxStreak: 0,
};

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { ...defaultStats };
  } catch {
    return { ...defaultStats };
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // silently fail if localStorage unavailable
  }
}

export function loadCompleted() {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCompleted(completed) {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
  } catch {
    // silently fail
  }
}
