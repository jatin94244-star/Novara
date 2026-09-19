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
      error: "Method not allowed. Use POST.",
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
          "Cloudflare environment variables are missing.",
      });
    }

    const body = req.body || {};

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const mode =
      typeof body.mode === "string"
        ? body.mode
        : "conversation";

    const scenario =
      typeof body.scenario === "string"
        ? body.scenario
        : "general";

    const history = Array.isArray(body.messages)
      ? body.messages
          .filter(
            (item) =>
              item &&
              (item.role === "user" ||
                item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-10)
      : [];

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "Message is required.",
      });
    }

    const systemPrompt = `
You are NOVARA, an advanced Japanese language tutor.

MODE:
${mode}

SCENARIO:
${scenario}

The learner is practicing Japanese.

You can help with:
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

IMPORTANT CONVERSATION RULES:

1. Continue the current conversation naturally.
2. Remember the recent context.
3. Do NOT restart the conversation.
4. Do NOT repeat the same Japanese sentence unnecessarily.
5. If the learner asks a question in English, answer the question in English while also providing useful Japanese when appropriate.
6. If the learner writes Japanese, respond naturally in Japanese.
7. Give the English meaning separately.
8. Ask a relevant follow-up question when appropriate.
9. Do not force the conversation into fixed topics.
10. The learner may talk about ANYTHING.

For Japanese learner messages:
- Evaluate correctness when appropriate.
- If there is an error, provide a concise correction.
- Do not invent an error when the sentence is correct.
- Give a useful natural alternative when helpful.

Return ONLY valid JSON.

Required format:

{
  "reply": "Japanese response",
  "english": "English meaning or explanation",
  "correction": null,
  "tip": null,
  "score": null,
  "followUp": null
}

Rules:
- reply must contain the actual Japanese response.
- english must contain the English meaning/explanation.
- correction should be null unless correction is useful.
- tip should be null unless useful.
- score should be a number from 0 to 100 only when evaluating Japanese.
- followUp should contain a natural follow-up question when appropriate.
- Never return markdown.
- Never wrap JSON in code fences.
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history,
      {
        role: "user",
        content: message,
      },
    ];

    const endpoint =
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-fast-v2`;

    const cloudflareResponse = await fetch(
      endpoint,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          messages,
          max_tokens: 700,
          temperature: 0.6,
        }),
      }
    );

    const rawText =
      await cloudflareResponse.text();

    let cloudflareData;

    try {
      cloudflareData =
        JSON.parse(rawText);
    } catch {
      console.error(
        "Cloudflare raw response:",
        rawText
      );

      return res.status(502).json({
        ok: false,
        error:
          "Cloudflare returned invalid JSON.",
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
          "Cloudflare AI request failed.",
      });
    }

    /*
     * Cloudflare can return structured JSON
     * directly inside result.response.
     */

    let aiResponse =
      cloudflareData?.result?.response;

    /*
     * Some responses can expose the model output
     * through choices.
     */

    if (
      !aiResponse &&
      Array.isArray(
        cloudflareData?.result?.choices
      )
    ) {
      const choice =
        cloudflareData.result.choices[0];

      const content =
        choice?.message?.content ||
        choice?.text ||
        "";

      if (typeof content === "string") {
        try {
          aiResponse =
            JSON.parse(content);
        } catch {
          /*
           * If the model returned plain text,
           * use it as the Japanese reply.
           */

          aiResponse = {
            reply: content,
            english: "",
            correction: null,
            tip: null,
            score: null,
            followUp: null,
          };
        }
      }
    }

    /*
     * Final safety fallback.
     */

    if (
      !aiResponse ||
      typeof aiResponse !== "object"
    ) {
      console.error(
        "Unexpected Cloudflare response:",
        JSON.stringify(
          cloudflareData,
          null,
          2
        )
      );

      return res.status(502).json({
        ok: false,
        error:
          "Cloudflare AI returned an invalid response.",
      });
    }

    return res.status(200).json({
      ok: true,

      reply:
        typeof aiResponse.reply === "string"
          ? aiResponse.reply
          : "",

      japanese:
        typeof aiResponse.reply === "string"
          ? aiResponse.reply
          : "",

      english:
        typeof aiResponse.english === "string"
          ? aiResponse.english
          : "",

      correction:
        typeof aiResponse.correction === "string"
          ? aiResponse.correction
          : null,

      tip:
        typeof aiResponse.tip === "string"
          ? aiResponse.tip
          : null,

      score:
        typeof aiResponse.score === "number"
          ? aiResponse.score
          : null,

      followUp:
        typeof aiResponse.followUp === "string"
          ? aiResponse.followUp
          : null,
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
        "A server error occurred.",
    });
  }
}