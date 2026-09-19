export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST."
    });
  }

  try {
    const accountId =
      process.env.CLOUDFLARE_ACCOUNT_ID;

    const apiToken =
      process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return res.status(500).json({
        ok: false,
        error:
          "Cloudflare environment variables are missing."
      });
    }

    const body = req.body || {};

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const mode =
      body.mode || "tutor";

    const scenario =
      body.scenario || "general";

    const history =
      Array.isArray(body.messages)
        ? body.messages
            .filter(
              (item) =>
                item &&
                (item.role === "user" ||
                  item.role === "assistant") &&
                typeof item.content === "string"
            )
            .slice(-12)
        : [];

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "Message is required."
      });
    }

    const systemPrompt = `
You are NOVARA, an intelligent Japanese language tutor.

MODE:
${mode}

SCENARIO:
${scenario}

The learner can ask ANY question related to Japanese.

You can help with:
- Japanese conversation
- vocabulary
- grammar
- translations
- pronunciation
- JLPT
- sentence correction
- travel Japanese
- food
- introductions
- daily Japanese
- culture
- roleplay
- free conversation

IMPORTANT:
Do NOT restrict the learner to a fixed list of topics.

If the user asks something in English,
answer their question normally.

If the user writes Japanese:
- determine whether it is correct
- explain mistakes if there are meaningful mistakes
- give a natural alternative when useful
- continue the conversation naturally

For conversation:
- ask a relevant follow-up question
- remember the recent conversation
- don't restart the conversation every turn

For grammar:
- explain simply
- give examples

For translation:
- give Japanese
- give English meaning
- explain nuance when useful

Return ONLY valid JSON.

Format:

{
  "reply": "main Japanese or tutor response",
  "english": "English explanation",
  "correction": null,
  "tip": null,
  "score": null,
  "followUp": null
}

If the learner's Japanese can be evaluated,
score it from 0 to 100.

If it cannot reasonably be scored,
use null.

Never return markdown fences.
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    const endpoint =
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct-fast`;

    const cloudflareResponse =
      await fetch(endpoint, {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiToken}`,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          messages,
          max_tokens: 700,
          temperature: 0.6
        })
      });

    const rawText =
      await cloudflareResponse.text();

    let cloudflareData = null;

    try {
      cloudflareData =
        JSON.parse(rawText);
    } catch {
      console.error(
        "Cloudflare returned non-JSON:",
        rawText
      );

      return res.status(502).json({
        ok: false,
        error:
          "Cloudflare returned an invalid response.",
        details:
          rawText.slice(0, 500)
      });
    }

    if (!cloudflareResponse.ok) {
      console.error(
        "Cloudflare API error:",
        cloudflareData
      );

      const cloudflareError =
        cloudflareData?.errors?.[0]?.message ||
        "Cloudflare AI request failed.";

      return res.status(502).json({
        ok: false,
        error: cloudflareError,
        cloudflare: cloudflareData?.errors || []
      });
    }

    const aiText =
      cloudflareData?.result?.response;

    if (
      typeof aiText !== "string" ||
      !aiText.trim()
    ) {
      console.error(
        "Unexpected Cloudflare response:",
        cloudflareData
      );

      return res.status(502).json({
        ok: false,
        error:
          "Cloudflare AI returned an empty response."
      });
    }

    let parsed;

    try {
      let cleaned =
        aiText.trim();

      cleaned =
        cleaned
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

      parsed =
        JSON.parse(cleaned);

    } catch {
      console.warn(
        "AI did not return JSON:",
        aiText
      );

      parsed = {
        reply: aiText,
        english: "",
        correction: null,
        tip: null,
        score: null,
        followUp: null
      };
    }

    let score = null;

    if (
      parsed.score !== null &&
      parsed.score !== undefined &&
      !Number.isNaN(
        Number(parsed.score)
      )
    ) {
      score = Math.max(
        0,
        Math.min(
          100,
          Number(parsed.score)
        )
      );
    }

    return res.status(200).json({
      ok: true,

      reply:
        parsed.reply ||
        aiText,

      japanese:
        parsed.reply ||
        aiText,

      english:
        parsed.english ||
        "",

      correction:
        parsed.correction ||
        null,

      tip:
        parsed.tip ||
        null,

      score,

      followUp:
        parsed.followUp ||
        null
    });

  } catch (error) {
    console.error(
      "NOVARA API ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,
      error:
        error?.message ||
        "A server error occurred."
    });
  }
}