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
          .slice(-12)
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
    CONVERSATION MODE
    =====================================================
    */

    const conversationRules = `
You are NOVARA, an advanced Japanese conversation partner.

SCENARIO:
${scenario}

The learner is practicing Japanese conversation.

IMPORTANT RULES:

1. ALWAYS continue the conversation naturally.

2. If the learner says something in English or Hindi,
understand what they mean and respond naturally in Japanese.

3. NEVER simply repeat the learner's sentence.

4. NEVER respond with only a correction.

5. Your "reply" MUST be a NEW Japanese conversational response.

6. Your "english" MUST explain/translate YOUR Japanese reply.

7. If the learner's Japanese has a mistake:
   - You may briefly mention the correction.
   - But still continue the conversation.
   - Do not let the correction replace the conversation.

8. Ask a natural follow-up question when appropriate.

9. Remember the previous messages.

10. Do not restart the conversation after every message.

Example:

Learner:
こんにちは

Good response:
reply:
こんにちは！今日はどうしましたか？

english:
Hello! How are you today?

BAD response:
こんにちは

BAD response:
もう一度言ってみてください。

Another example:

Learner:
I am learning Japanese.

Good response:
reply:
いいですね！日本語の勉強は楽しいですか？

english:
That's great! Do you enjoy studying Japanese?

The learner may use:
- English
- Hindi
- Japanese
- mixed language

Understand all of them.

Keep Japanese appropriate for a beginner/intermediate learner.
`;

    /*
    =====================================================
    GRAMMAR MODE
    =====================================================
    */

    const grammarRules = `
You are NOVARA, an advanced Japanese grammar checker.

The learner submitted:

"${message}"

Analyze THIS Japanese sentence.

IMPORTANT:

1. Do NOT start a conversation.

2. Do NOT ask a follow-up question.

3. Do NOT simply repeat the submitted sentence.

4. Determine whether the Japanese sentence is grammatically natural.

5. Give a score from 0 to 100.

6. If the sentence is correct:
   - correction should contain the natural/correct sentence.
   - explain why it is correct.

7. If the sentence is incorrect:
   - correction should contain the corrected Japanese sentence.
   - explain the important mistake.

8. "english" must give the English meaning.

9. "tip" must give one useful learning tip.

10. "reply" should contain a short Japanese assessment,
not merely copy the input.

11. Keep explanations simple and useful for a Japanese learner.

Examples:

Input:
私は学生です。

Good:
reply:
この文は自然で正しいです。

english:
I am a student.

correction:
私は学生です。

score:
100

tip:
「です」は丁寧な文の最後によく使われます。

Another example:

Input:
私は日本語を勉強するです。

Good:
reply:
「するです」ではなく「します」を使うと自然です。

english:
I study Japanese.

correction:
私は日本語を勉強します。

score:
70

tip:
丁寧な文では「します」を使います。
`;

    /*
    =====================================================
    GENERAL / TUTOR MODE
    =====================================================
    */

    const tutorRules = `
You are NOVARA, an advanced Japanese language tutor.

Help the learner with:

- Japanese
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
- conversation

Answer naturally and clearly.

If the learner asks something in English or Hindi,
understand it normally.

When Japanese is involved, provide useful Japanese
examples where appropriate.
`;

    let systemPrompt;

    if (mode === "grammar") {
      systemPrompt = grammarRules;
    } else if (mode === "conversation") {
      systemPrompt = conversationRules;
    } else {
      systemPrompt = tutorRules;
    }

    /*
    =====================================================
    JSON OUTPUT INSTRUCTION
    =====================================================
    */

    systemPrompt += `

RETURN ONLY VALID JSON.

Do NOT use markdown.
Do NOT use code fences.
Do NOT add text before or after the JSON.

Use EXACTLY this structure:

{
  "reply": "string",
  "english": "string",
  "correction": null,
  "tip": null,
  "score": null,
  "followUp": null
}

RULES FOR FIELDS:

reply:
Main response.

english:
English meaning/explanation.

correction:
Japanese correction when relevant.
Otherwise null.

tip:
Useful Japanese learning tip.
Otherwise null.

score:
Number from 0 to 100 when evaluating Japanese.
Otherwise null.

followUp:
A NEW Japanese follow-up question when appropriate.
Otherwise null.

IMPORTANT:
Never put the same sentence in both reply and followUp.

Never use the learner's exact sentence as the only reply.
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
              : 500,

          temperature:
            mode === "grammar"
              ? 0.2
              : 0.7,
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
    CLOUDFLARE RESPONSE
    =====================================================
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
        error:
          "Cloudflare AI returned an invalid response.",
      });
    }

    /*
    =====================================================
    NORMALIZE RESPONSE
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
      typeof aiResponse.correction === "string"
        ? aiResponse.correction.trim()
        : null;

    const tip =
      typeof aiResponse.tip === "string"
        ? aiResponse.tip.trim()
        : null;

    const followUp =
      typeof aiResponse.followUp === "string"
        ? aiResponse.followUp.trim()
        : null;

    let score = null;

    if (
      typeof aiResponse.score ===
      "number"
    ) {
      score = Math.max(
        0,
        Math.min(100, aiResponse.score)
      );
    }

    /*
    =====================================================
    EMPTY RESPONSE PROTECTION
    =====================================================
    */

    if (!reply) {
      return res.status(502).json({
        ok: false,
        error:
          "Cloudflare AI returned an empty response.",
      });
    }

    /*
    =====================================================
    FINAL RESPONSE
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