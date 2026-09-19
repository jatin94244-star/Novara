export default async function handler(req, res) {
  // --------------------------------------------------
  // CORS
  // --------------------------------------------------

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Browser preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST is allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // --------------------------------------------------
    // ENVIRONMENT VARIABLES
    // --------------------------------------------------

    const accountId =
      process.env.CLOUDFLARE_ACCOUNT_ID;

    const apiToken =
      process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error(
        "Cloudflare environment variables are missing."
      );

      return res.status(500).json({
        error:
          "Cloudflare API configuration is missing.",
      });
    }

    // --------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------

    const {
      message,
      scenario = "general",
    } = req.body || {};

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        error: "Message is required.",
      });
    }

    // --------------------------------------------------
    // NOVARA SYSTEM PROMPT
    // --------------------------------------------------

    const systemPrompt = `
You are Novara, an AI Japanese language tutor.

Your job is to help a beginner learn Japanese.

Rules:
- Reply naturally and clearly.
- Prefer beginner-friendly Japanese.
- Explain mistakes briefly.
- Give the corrected Japanese when appropriate.
- Include an English explanation.
- Encourage the learner.
- Do not overwhelm the learner with advanced grammar.
- Keep responses concise.

The current conversation scenario is:
${scenario}

Return your response as JSON with exactly these fields:

{
  "japanese": "Japanese response",
  "english": "English explanation",
  "correction": null,
  "score": 90
}

If the learner makes a Japanese mistake:
- put the corrected sentence in "correction"
- give a score between 0 and 100

If there is no meaningful mistake:
- use null for "correction"
- give an appropriate score.
`;

    // --------------------------------------------------
    // CLOUDFLARE WORKERS AI
    // --------------------------------------------------

    const endpoint =
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`;

    const cloudflareResponse =
      await fetch(endpoint, {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${apiToken}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: message.trim(),
            },
          ],

          max_tokens: 500,

          temperature: 0.7,
        }),
      });

    const data =
      await cloudflareResponse.json();

    // --------------------------------------------------
    // CLOUDFLARE ERROR
    // --------------------------------------------------

    if (!cloudflareResponse.ok) {
      console.error(
        "Cloudflare API error:",
        data
      );

      return res.status(
        cloudflareResponse.status
      ).json({
        error:
          data?.errors?.[0]?.message ||
          "Cloudflare AI request failed.",
      });
    }

    // --------------------------------------------------
    // GET AI TEXT
    // --------------------------------------------------

    const aiText =
      data?.result?.response ||
      "";

    if (!aiText) {
      console.error(
        "Empty Cloudflare response:",
        data
      );

      return res.status(502).json({
        error:
          "AI returned an empty response.",
      });
    }

    // --------------------------------------------------
    // PARSE NOVARA JSON
    // --------------------------------------------------

    let parsed;

    try {
      // Remove possible markdown code fences
      const cleaned =
        aiText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn(
        "AI did not return valid JSON. Using fallback.",
        aiText
      );

      parsed = {
        japanese: aiText,
        english:
          "Good effort! Let's continue practicing Japanese.",
        correction: null,
        score: 90,
      };
    }

    // --------------------------------------------------
    // NORMALIZE RESPONSE
    // --------------------------------------------------

    const response = {
      japanese:
        parsed.japanese ||
        aiText,

      english:
        parsed.english ||
        "Let's continue practicing Japanese.",

      correction:
        parsed.correction ?? null,

      score:
        Number.isFinite(
          Number(parsed.score)
        )
          ? Math.max(
              0,
              Math.min(
                100,
                Number(parsed.score)
              )
            )
          : 90,

      scenario,
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error(
      "Novara API error:",
      error
    );

    return res.status(500).json({
      error:
        "Internal server error.",
    });
  }
}