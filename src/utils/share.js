import config from "../config.js";

// Emoji map: difficulty 4 (hardest) = red, 1 (easiest) = blue
const EMOJI = { 4: "🟥", 3: "🟧", 2: "🟩", 1: "🟦" };

export function generateShareText(puzzle, guessHistory) {
  // guessHistory is an array of { groupIndex, correct } objects in order
  let text = `${config.siteName} #${puzzle.number}\n`;

  // Build rows from guess history
  const rows = [];
  const solved = [];
  for (const guess of guessHistory) {
    if (guess.correct) {
      const diff = puzzle.groups[guess.groupIndex].difficulty;
      rows.push(EMOJI[diff].repeat(4));
      solved.push(guess.groupIndex);
    } else {
      // Show what the player guessed as mixed colors
      const row = guess.items
        .map((item) => {
          const gi = puzzle.groups.findIndex((g) => g.items.includes(item));
          return EMOJI[puzzle.groups[gi]?.difficulty || 1];
        })
        .join("");
      rows.push(row);
    }
  }

  text += rows.join("\n");
  if (config.social.hashtag) text += `\n${config.social.hashtag}`;
  return text;
}

// Simpler version: just show solved order
export function generateSimpleShareText(puzzle, solveOrder, mistakes) {
  let text = `${config.siteName} #${puzzle.number}\n`;

  if (solveOrder && solveOrder.length > 0) {
    text += solveOrder
      .map((gi) => {
        const diff = puzzle.groups[gi].difficulty;
        return EMOJI[diff].repeat(4);
      })
      .join("\n");
  }

  const totalGroups = puzzle.groups.length;
  const solved = solveOrder?.length || 0;

  if (solved === totalGroups) {
    // Won
    if (mistakes > 0) text += `\n${mistakes} mistake${mistakes !== 1 ? "s" : ""}`;
  } else {
    // Lost
    text += `\n❌ ${solved}/${totalGroups} groups found`;
  }

  if (config.social.hashtag) text += `\n${config.social.hashtag}`;
  return text;
}

export async function shareResults(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      // user cancelled or error — fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
