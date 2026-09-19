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
        error: "Message is required.",
      });
    }

    const systemPrompt = `
You are NOVARA, an advanced Japanese language tutor.

MODE:
${mode}

SCENARIO:
${scenario}

The learner can talk about ANYTHING related to Japanese.

For conversation:
- Continue the current conversation naturally.
- Remember previous messages.
- Do NOT restart the conversation.
- Do NOT restrict the user to predefined topics.
- Reply naturally in Japanese.
- Ask a relevant follow-up question when appropriate.
- If the user writes English, understand it and help them learn Japanese.
- If the user writes Japanese, respond naturally in Japanese.

For every response:
1. Give the natural Japanese response.
2. Give an English explanation/translation.
3. If the learner's Japanese contains an actual mistake, provide a correction.
4. Give a short useful tip when appropriate.
5. Give a score only when the learner's Japanese can reasonably be evaluated.

IMPORTANT:
Return ONLY valid JSON.

Use exactly this structure:

{
  "reply": "Japanese response",
  "english": "English translation or explanation",
  "correction": null,
  "tip": null,
  "score": null,
  "followUp": null
}

Do not use markdown.
Do not use code fences.
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
          temperature: 0.5,
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
        "Cloudflare returned invalid JSON:",
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
          cloudflareData?.errors?.[0]
            ?.message ||
          "Cloudflare AI request failed.",
      });
    }

    /*
     * Cloudflare can return:
     *
     * result.response = "Japanese text"
     *
     * OR
     *
     * result.response = {
     *   reply,
     *   english,
     *   correction,
     *   tip,
     *   score,
     *   followUp
     * }
     *
     * It can also return the normal
     * OpenAI-compatible:
     *
     * result.choices[0].message.content
     */

    let aiResponse =
      cloudflareData?.result?.response;

    // -----------------------------------------
    // FORMAT 1:
    // result.response is an object
    // -----------------------------------------

    if (
      aiResponse &&
      typeof aiResponse === "object" &&
      !Array.isArray(aiResponse)
    ) {
      return res.status(200).json({
        ok: true,

        reply:
          aiResponse.reply ||
          "",

        japanese:
          aiResponse.reply ||
          "",

        english:
          aiResponse.english ||
          "",

        correction:
          aiResponse.correction ||
          null,

        tip:
          aiResponse.tip ||
          null,

        score:
          typeof aiResponse.score === "number"
            ? aiResponse.score
            : null,

        followUp:
          aiResponse.followUp ||
          null,
      });
    }

    // -----------------------------------------
    // FORMAT 2:
    // result.response is plain string
    // -----------------------------------------

    if (
      typeof aiResponse === "string" &&
      aiResponse.trim()
    ) {
      const text =
        aiResponse.trim();

      /*
       * Sometimes the model follows our JSON
       * instruction and puts JSON inside the
       * string. Try parsing it first.
       */

      try {
        const parsed =
          JSON.parse(text);

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          return res.status(200).json({
            ok: true,

            reply:
              parsed.reply ||
              parsed.japanese ||
              "",

            japanese:
              parsed.reply ||
              parsed.japanese ||
              "",

            english:
              parsed.english ||
              "",

            correction:
              parsed.correction ||
              null,

            tip:
              parsed.tip ||
              null,

            score:
              typeof parsed.score ===
              "number"
                ? parsed.score
                : null,

            followUp:
              parsed.followUp ||
              null,
          });
        }
      } catch {
        // Not JSON.
        // That's completely okay.
      }

      /*
       * Plain Japanese response.
       * Do NOT return 502.
       */

      return res.status(200).json({
        ok: true,

        reply: text,

        japanese: text,

        english: "",

        correction: null,

        tip: null,

        score: null,

        followUp: null,
      });
    }

    // -----------------------------------------
    // FORMAT 3:
    // OpenAI-compatible choices response
    // -----------------------------------------

    const choiceContent =
      cloudflareData?.result?.choices?.[0]
        ?.message?.content;

    if (
      typeof choiceContent === "string" &&
      choiceContent.trim()
    ) {
      const text =
        choiceContent.trim();

      try {
        const parsed =
          JSON.parse(text);

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          return res.status(200).json({
            ok: true,

            reply:
              parsed.reply ||
              parsed.japanese ||
              "",

            japanese:
              parsed.reply ||
              parsed.japanese ||
              "",

            english:
              parsed.english ||
              "",

            correction:
              parsed.correction ||
              null,

            tip:
              parsed.tip ||
              null,

            score:
              typeof parsed.score ===
              "number"
                ? parsed.score
                : null,

            followUp:
              parsed.followUp ||
              null,
          });
        }
      } catch {
        // Plain text response.
      }

      return res.status(200).json({
        ok: true,

        reply: text,

        japanese: text,

        english: "",

        correction: null,

        tip: null,

        score: null,

        followUp: null,
      });
    }

    // -----------------------------------------
    // Nothing usable
    // -----------------------------------------

    console.error(
      "Cloudflare returned no usable response:",
      JSON.stringify(
        cloudflareData,
        null,
        2
      )
    );

    return res.status(502).json({
      ok: false,
      error:
        "Cloudflare AI returned an empty response.",
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