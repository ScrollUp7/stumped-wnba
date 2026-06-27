// Vercel Serverless Function — proxies research extraction to Anthropic API
// API key is stored in Vercel environment variables, never exposed to frontend

const SYSTEM_PROMPT = `You are a puzzle category extractor for a WNBA daily puzzle game called "Stumped." The game uses the NYT Connections format: each puzzle has 4 categories, each category has exactly 4 items.

Your job: read sports research notes and extract every potential category of exactly 4 items. 

RULES:
1. Each category must have EXACTLY 4 items — no more, no less
2. Items can be player names, team names, years, stats, or short phrases
3. Keep item text SHORT (1-4 words max) so it fits on a game tile
4. Categories should come directly from the research — use the data and framing that's actually there
5. Look for: ranked lists (top 4), historical lists, stat leaders, team groupings, record holders, milestone chasers
6. For ranked lists longer than 4, take the top 4 OR find a natural cutoff
7. Write the category label as a specific, factual description (e.g., "Most APG this season (top 4)" not "Good passers")
8. Write a hint that uses language and framing from the research itself — sound like a broadcast analyst, not a chatbot
9. Assign difficulty 1-4 based on how obscure the knowledge is (1=most fans know, 4=deep cut)
10. Flag if any item appears in multiple categories — the game requires unique items per puzzle

Respond with ONLY a JSON array, no markdown fences, no other text. Each object:
{
  "label": "Category label",
  "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
  "difficulty": 1-4,
  "hint": "Broadcast-voice hint from the research",
  "source": "Brief note on which part of the research this comes from",
  "confidence": "high" | "medium" | "low"
}

Extract as many valid categories as possible. Better to surface 15 candidates and let the editor pick 4 than to miss good ones.`;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check editor password
  const editorPassword = process.env.EDITOR_PASSWORD;
  if (editorPassword && req.body.password !== editorPassword) {
    return res.status(401).json({ error: "Invalid editor password" });
  }

  // Get API key from environment
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const { text, fileBase64, fileType } = req.body;

    // Build message content
    let userContent;
    if (fileBase64) {
      userContent = [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: fileType || "application/pdf",
            data: fileBase64,
          },
        },
        {
          type: "text",
          text: "Extract all puzzle category candidates from this research packet.",
        },
      ];
    } else if (text) {
      userContent =
        "Extract all puzzle category candidates from this research packet:\n\n" +
        text;
    } else {
      return res.status(400).json({ error: "No research content provided" });
    }

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res
        .status(response.status)
        .json({ error: "Anthropic API error: " + errText.slice(0, 300) });
    }

    const data = await response.json();

    // Check for truncation
    if (data.stop_reason === "max_tokens") {
      return res
        .status(422)
        .json({ error: "Response truncated — research may be too long" });
    }

    // Extract text from response
    const resultText = data.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    if (!resultText) {
      return res.status(500).json({ error: "No text in API response" });
    }

    // Parse JSON
    const clean = resultText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) {
      return res.status(500).json({ error: "Response is not an array" });
    }

    return res.status(200).json({ categories: parsed });
  } catch (err) {
    console.error("Extract error:", err);
    return res
      .status(500)
      .json({ error: "Processing failed: " + err.message });
  }
}
