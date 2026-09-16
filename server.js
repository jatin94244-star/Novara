import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

// Cloudflare Workers AI model
const MODEL = "@cf/meta/llama-3.2-1b-instruct";

app.get("/", (req, res) => {
  res.send("Novara AI Server is Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Novara AI server is running",
    cloudflareConfigured: Boolean(
      ACCOUNT_ID && API_TOKEN
    ),
  });
});

async function askCloudflare(prompt) {
  if (!ACCOUNT_ID || !API_TOKEN) {
    throw new Error(
      "Cloudflare Account ID or API Token is missing"
    );
  }

  const url =
    `https://api.cloudflare.com/client/v4/accounts/` +
    `${ACCOUNT_ID}/ai/run/${MODEL}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are Novara, an AI Japanese language tutor. " +
            "Help beginner Japanese learners. " +
            "Keep answers concise, natural and educational.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    console.error("Cloudflare Error:", data);

    throw new Error(
      data?.errors?.[0]?.message ||
        `Cloudflare API failed with status ${response.status}`
    );
  }

  return data.result?.response || "";
}

// ==============================
// AI CONVERSATION
// ==============================

app.post("/api/chat", async (req, res) => {
  try {
    const { message, scenario } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const prompt = `
Scenario: ${scenario || "general"}

The learner said:
"${message.trim()}"

Reply as a Japanese conversation partner.

Return ONLY valid JSON in this exact structure:

{
  "japanese": "Japanese reply",
  "english": "English translation",
  "correction": null,
  "score": 90
}

If the learner made a Japanese grammar or wording mistake,
put a short correction in "correction".

Give a score from 0 to 100.
`;

    const raw = await askCloudflare(prompt);

    let result;

    try {
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      result = JSON.parse(cleaned);
    } catch {
      result = {
        japanese: raw,
        english: "",
        correction: null,
        score: 80,
      };
    }

    res.json({
      japanese: result.japanese || "",
      english: result.english || "",
      correction: result.correction || null,
      score:
        typeof result.score === "number"
          ? result.score
          : 80,
      scenario: scenario || "general",
    });
  } catch (error) {
    console.error("OpenAI/Cloudflare Error:", error);

    res.status(500).json({
      error: "AI server error",
      details: error.message,
    });
  }
});

// ==============================
// AI GRAMMAR CHECKER
// ==============================

app.post("/api/grammar", async (req, res) => {
  try {
    const { text, language = "Japanese" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Text is required",
      });
    }

    const prompt = `
You are Novara AI Grammar Checker.

Language: ${language}

Learner text:
"${text.trim()}"

Analyze the sentence and return ONLY valid JSON:

{
  "correct": true,
  "original": "original sentence",
  "corrected": "corrected sentence",
  "explanation": "simple explanation",
  "english": "English meaning",
  "score": 90
}

Rules:
- If the sentence is already correct, keep "corrected"
  the same and set "correct" to true.
- If incorrect, provide the natural correction.
- Explain the mistake simply for a beginner.
- Score from 0 to 100.
`;

    const raw = await askCloudflare(prompt);

    let result;

    try {
      const cleaned = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      result = JSON.parse(cleaned);
    } catch {
      result = {
        correct: false,
        original: text,
        corrected: raw,
        explanation: "Novara could not format the result.",
        english: "",
        score: 70,
      };
    }

    res.json(result);
  } catch (error) {
    console.error("Grammar Error:", error);

    res.status(500).json({
      error: "Grammar AI server error",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Novara AI server running on http://localhost:${PORT}`
  );

  console.log(
    `Cloudflare configured: ${Boolean(
      ACCOUNT_ID && API_TOKEN
    )}`
  );
});