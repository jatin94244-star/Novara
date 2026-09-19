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
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return res.status(500).json({
        ok: false,
        error: "Cloudflare environment variables are missing."
      });
    }

    const body = req.body || {};

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const mode = body.mode || "tutor";
    const scenario = body.scenario || "general";

    const history = Array.isArray(body.messages)
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
You are NOVARA, an advanced Japanese language tutor.

MODE:
${mode}

SCENARIO:
${scenario}

The learner can ask ANY question related to Japanese.

Help with:
- Japanese conversation
- vocabulary
- grammar
- translation
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

Do NOT restrict the learner to fixed topics.

If the user asks something in English,
answer normally.

If the user writes Japanese:
- evaluate correctness
- explain meaningful mistakes
- give natural alternatives when useful
- continue naturally

For conversation:
- remember recent context
- ask a relevant follow-up question
- do not restart the conversation

For grammar:
- explain simply
- give examples

For translation:
- provide Japanese
- provide English meaning
- explain nuance when useful

Return ONLY a JSON object.

Required format:

{
  "reply": "Japanese response",
  "english": "English explanation",
  "correction": null,
  "tip": null,
  "score": null,
  "followUp": null
}

Score should be 0-100 only when the learner's Japanese can reasonably be evaluated.

If a score is not appropriate, use null.

Do not use markdown code fences.
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
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-fast-v2`;

    const cloudflareResponse = await fetch(endpoint, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        messages,
        max_tokens: 700,
        temperature: 0.6
      })
    });

    const rawText = await cloudflareResponse.text();

    let cloudflareData;

    try {
      cloudflareData = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        ok: false,
        error: "Cloudflare returned invalid JSON.",
        details: rawText.slice(0, 500)
      });
    }

    if (!cloudflareResponse.ok) {
      console.error(
        "Cloudflare API error:",
        cloudflareData
      );

      return res.status(502).json({
        ok: false,
        error:
          cloudflareData?.errors?.[0]?.message ||
          "Cloudflare AI request failed."
      });
    }

    /*
      IMPORTANT:
      Cloudflare's current response is:

      result: {
        response: {
          reply,
          english,
          correction,
          tip,
          score,
          followUp
        }
      }
    */

    const aiResponse =
      cloudflareData?.result?.response;

    if (
      !aiResponse ||
      typeof aiResponse !== "object"
    ) {
      console.error(
        "Unexpected Cloudflare response:",
        cloudflareData
      );

      return res.status(502).json({
        ok: false,
        error: "Cloudflare AI returned an invalid response."
      });
    }

    return res.status(200).json({
      ok: true,

      reply:
        aiResponse.reply || "",

      japanese:
        aiResponse.reply || "",

      english:
        aiResponse.english || "",

      correction:
        aiResponse.correction || null,

      tip:
        aiResponse.tip || null,

      score:
        typeof aiResponse.score === "number"
          ? aiResponse.score
          : null,

      followUp:
        aiResponse.followUp || null
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