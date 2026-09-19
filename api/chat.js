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
        : "tutor";

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
          .map((item) => ({
            role: item.role,
            content: item.content,
          }))
      : [];

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "Message is required.",
      });
    }

    /*
    =====================================================
    CONVERSATION PROMPT
    =====================================================
    */

    const conversationPrompt = `
You are NOVARA, an advanced Japanese conversation partner.

The learner is practicing Japanese.

SCENARIO:
${scenario}

USER MESSAGE:
${message}

IMPORTANT CONVERSATION RULES:

1. Understand the user's meaning even if they write:
   - English
   - Hindi
   - Hinglish
   - Japanese
   - mixed language

2. Your "reply" MUST be a NEW natural Japanese response.

3. NEVER simply repeat the user's message.

4. NEVER make "reply" just a correction.

5. NEVER say "もう一度言ってみてください" unless
the user's message is genuinely impossible to understand.

6. Continue the current conversation naturally.

7. If the user asks something like:
   "how to order food in a restaurant or cafe"

   respond in Japanese with useful examples.

8. If the user makes a Japanese mistake:
   continue the conversation first, and put a short correction
   in the "correction" field.

9. "english" MUST translate/explain YOUR "reply".
   It must NOT be a generic explanation unrelated to reply.

10. "followUp" should be a NEW Japanese question only when
    a follow-up is useful.

11. Do not put the same Japanese sentence in reply and followUp.

12. Keep the Japanese suitable for a beginner/intermediate learner.

EXAMPLE:

User:
I am learning Japanese.

Correct output:

{
  "reply": "いいですね！日本語の勉強は楽しいですか？",
  "english": "That's great! Do you enjoy studying Japanese?",
  "correction": null,
  "tip": "「いいですね」は相手の話に賛成するときによく使います。",
  "score": null,
  "followUp": "どんな日本語を勉強していますか？"
}

Another example:

User:
how to order food in restro or a cafe

Correct output:

{
  "reply": "もちろんです！レストランでは「これをください」と言うと注文できます。カフェなら「コーヒーを一つください」のように言えます。",
  "english": "Of course! In a restaurant, you can order by saying 'これをください' (I'll have this, please). At a cafe, you can say 'コーヒーを一つください' (One coffee, please).",
  "correction": null,
  "tip": "「ください」は注文するときによく使う便利な expression です。",
  "score": null,
  "followUp": "カフェで注文する練習をしてみますか？"
}

Return ONLY valid JSON.
`;

    /*
    =====================================================
    GRAMMAR PROMPT
    =====================================================
    */

    const grammarPrompt = `
You are NOVARA, an advanced Japanese grammar checker.

Analyze this Japanese sentence:

${message}

RULES:

1. Do NOT start a conversation.
2. Do NOT ask a follow-up question.
3. Do NOT simply repeat the input.
4. Check Japanese grammar and naturalness.
5. Give a score from 0 to 100.
6. Give a corrected Japanese sentence.
7. Give the English meaning.
8. Explain the grammar simply.
9. Give one useful learning tip.
10. "reply" should be a short Japanese assessment.

Example:

Input:
私は日本語を勉強するです。

Output:

{
  "reply": "「するです」ではなく「します」を使うと自然です。",
  "english": "I study Japanese.",
  "correction": "私は日本語を勉強します。",
  "tip": "丁寧な文では「します」を使います。",
  "score": 70,
  "followUp": null
}

Return ONLY valid JSON.
`;

    /*
    =====================================================
    TUTOR PROMPT
    =====================================================
    */

    const tutorPrompt = `
You are NOVARA, an advanced Japanese language tutor.

Help the learner with:

- Japanese grammar
- vocabulary
- translation
- pronunciation
- JLPT
- Japanese conversation
- travel Japanese
- food
- introductions
- daily Japanese
- culture

Understand English, Hindi and Hinglish.

Give useful Japanese examples where appropriate.

Return ONLY valid JSON:

{
  "reply": "answer",
  "english": "English explanation",
  "correction": null,
  "tip": null,
  "score": null,
  "followUp": null
}
`;

    let systemPrompt;

    if (mode === "grammar") {
      systemPrompt = grammarPrompt;
    } else if (mode === "conversation") {
      systemPrompt = conversationPrompt;
    } else {
      systemPrompt = tutorPrompt;
    }

    /*
    =====================================================
    CLOUDFARE MESSAGES
    =====================================================
    */

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

    const cloudflareResponse =
      await fetch(endpoint, {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiToken}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          messages,

          max_tokens:
            mode === "grammar"
              ? 700
              : 600,

          temperature:
            mode === "grammar"
              ? 0.2
              : 0.5,
        }),
      });

    const rawText =
      await cloudflareResponse.text();

    let cloudflareData;

    try {
      cloudflareData =
        JSON.parse(rawText);
    } catch {
      console.error(
        "Cloudflare invalid JSON:",
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
    =====================================================
    EXTRACT AI RESPONSE
    =====================================================
    */

    let aiResponse =
      cloudflareData?.result?.response;

    /*
      Sometimes Cloudflare/model can return response
      as a JSON string instead of an object.
    */

    if (typeof aiResponse === "string") {
      try {
        aiResponse =
          JSON.parse(aiResponse);
      } catch {
        /*
          If it isn't JSON, try the OpenAI-style
          choices response.
        */

        aiResponse = null;
      }
    }

    /*
      Fallback: OpenAI-compatible response shape
    */

    if (
      !aiResponse ||
      typeof aiResponse !== "object"
    ) {
      const content =
        cloudflareData?.result?.choices?.[0]
          ?.message?.content;

      if (typeof content === "string") {
        try {
          aiResponse =
            JSON.parse(content);
        } catch {
          /*
            Sometimes the model puts JSON inside
            markdown fences.
          */

          const cleaned =
            content
              .replace(
                /^```json\s*/i,
                ""
              )
              .replace(
                /^```\s*/i,
                ""
              )
              .replace(
                /\s*```$/i,
                ""
              )
              .trim();

          try {
            aiResponse =
              JSON.parse(cleaned);
          } catch {
            aiResponse = null;
          }
        }
      }
    }

    /*
    =====================================================
    LAST FALLBACK
    =====================================================
    */

    if (
      !aiResponse ||
      typeof aiResponse !== "object"
    ) {
      console.error(
        "Could not parse Cloudflare AI response:",
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

    /*
    =====================================================
    NORMALIZE
    =====================================================
    */

    const reply =
      typeof aiResponse.reply === "string"
        ? aiResponse.reply.trim()
        : "";

    const english =
      typeof aiResponse.english === "string"
        ? aiResponse.english.trim()
        : "";

    const correction =
      typeof aiResponse.correction === "string" &&
      aiResponse.correction.trim()
        ? aiResponse.correction.trim()
        : null;

    const tip =
      typeof aiResponse.tip === "string" &&
      aiResponse.tip.trim()
        ? aiResponse.tip.trim()
        : null;

    const followUp =
      typeof aiResponse.followUp === "string" &&
      aiResponse.followUp.trim()
        ? aiResponse.followUp.trim()
        : null;

    let score = null;

    if (
      typeof aiResponse.score ===
      "number"
    ) {
      score = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            aiResponse.score
          )
        )
      );
    }

    if (!reply) {
      console.error(
        "AI response had no reply:",
        aiResponse
      );

      return res.status(502).json({
        ok: false,
        error:
          "Cloudflare AI returned an empty response.",
      });
    }

    /*
    =====================================================
    RETURN TO FRONTEND
    =====================================================
    */

    return res.status(200).json({
      ok: true,

      mode,

      reply,

      japanese: reply,

      english,

      correction,

      tip,

      score,

      followUp,
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