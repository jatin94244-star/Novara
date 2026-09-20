import React, {
  useEffect,
  useRef,
  useState,
} from "react";

const quickPrompts = [
  {
    icon: "👋",
    title: "Greetings",
    prompt:
      "Teach me common Japanese greetings for beginners.",
  },
  {
    icon: "🙋",
    title: "Introduce myself",
    prompt:
      "Teach me how to introduce myself in Japanese.",
  },
  {
    icon: "🍜",
    title: "Food",
    prompt:
      "Teach me useful Japanese phrases for ordering food.",
  },
  {
    icon: "🚆",
    title: "Travel",
    prompt:
      "Teach me useful Japanese phrases for travelling.",
  },
  {
    icon: "📚",
    title: "Grammar",
    prompt:
      "Explain the difference between は and が in simple Japanese.",
  },
  {
    icon: "🎯",
    title: "JLPT N5",
    prompt:
      "Give me one JLPT N5 Japanese question and wait for my answer.",
  },
];

function speak(text) {
  if (
    typeof window === "undefined" ||
    !window.speechSynthesis ||
    !text
  ) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "ja-JP";
  utterance.rate = 0.82;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

/* =========================================================
   HISTORY
========================================================= */

function historyForAPI(messages) {
  return messages
    .filter(
      (message) =>
        message.role === "user" ||
        message.role === "ai"
    )
    .slice(-12)
    .map((message) => ({
      role:
        message.role === "ai"
          ? "assistant"
          : "user",

      content:
        typeof message.text === "string"
          ? message.text
          : "",
    }));
}

/* =========================================================
   SAFE JSON PARSER
========================================================= */

function tryParseJSON(value) {
  if (typeof value !== "string") {
    return value;
  }

  let text = value.trim();

  if (!text) {
    return value;
  }

  /* Remove markdown fences */

  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
}

/* =========================================================
   EXTRACT ACTUAL AI RESPONSE
========================================================= */

function cleanAIResponse(data) {
  let value = data;

  /*
    Possible response shapes:

    {
      reply: "...",
      english: "..."
    }

    OR

    {
      result: {
        reply: "...",
        english: "..."
      }
    }

    OR

    {
      result: {
        response: {
          reply: "...",
          english: "..."
        }
      }
    }

    OR reply itself contains JSON string.
  */

  if (
    value &&
    typeof value === "object" &&
    value.result
  ) {
    value = value.result;
  }

  if (
    value &&
    typeof value === "object" &&
    value.response
  ) {
    value = value.response;
  }

  if (
    value &&
    typeof value === "object" &&
    value.choices &&
    Array.isArray(value.choices)
  ) {
    const choice = value.choices[0];

    if (choice?.message?.content) {
      value = choice.message.content;
    } else if (choice?.text) {
      value = choice.text;
    }
  }

  /*
    If API returned a string,
    try to parse it.
  */

  if (typeof value === "string") {
    const parsed = tryParseJSON(value);

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      value = parsed;
    }
  }

  /*
    Sometimes reply itself contains JSON.
  */

  if (
    value &&
    typeof value === "object" &&
    typeof value.reply === "string"
  ) {
    const parsedReply =
      tryParseJSON(value.reply);

    if (
      parsedReply &&
      typeof parsedReply === "object" &&
      (
        parsedReply.reply ||
        parsedReply.japanese ||
        parsedReply.english
      )
    ) {
      value = {
        ...value,
        ...parsedReply,
      };
    }
  }

  /*
    Final normalized object
  */

  if (
    value &&
    typeof value === "object"
  ) {
    return {
      reply:
        typeof value.reply === "string"
          ? value.reply.trim()
          : typeof value.japanese === "string"
          ? value.japanese.trim()
          : typeof value.content === "string"
          ? value.content.trim()
          : "",

      english:
        typeof value.english === "string"
          ? value.english.trim()
          : "",

      correction:
        typeof value.correction === "string"
          ? value.correction.trim()
          : null,

      tip:
        typeof value.tip === "string"
          ? value.tip.trim()
          : null,

      score:
        typeof value.score === "number"
          ? value.score
          : null,

      followUp:
        typeof value.followUp === "string"
          ? value.followUp.trim()
          : null,
    };
  }

  /*
    Plain text fallback
  */

  return {
    reply:
      typeof value === "string"
        ? value.trim()
        : "",

    english: "",
    correction: null,
    tip: null,
    score: null,
    followUp: null,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Tutor() {
  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [isThinking, setIsThinking] =
    useState(false);

  const inputRef =
    useRef(null);

  const chatRef =
    useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!chatRef.current) return;

    chatRef.current.scrollTop =
      chatRef.current.scrollHeight;
  }, [messages, isThinking]);

  /* =======================================================
     ASK TUTOR
  ======================================================= */

  async function askTutor(customPrompt) {
    const text =
      typeof customPrompt === "string"
        ? customPrompt
        : input;

    const cleanText =
      text.trim();

    if (
      !cleanText ||
      isThinking
    ) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: cleanText,
    };

    const previousMessages =
      messages;

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setIsThinking(true);

    try {
      const response =
        await fetch(
          "https://novara-ruby.vercel.app/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              message: cleanText,

              scenario:
                "free_tutor",

              mode:
                "tutor",

              messages:
                historyForAPI(
                  previousMessages
                ),
            }),
          }
        );

      const raw =
        await response.text();

      let data;

      try {
        data =
          JSON.parse(raw);
      } catch {
        throw new Error(
          raw ||
            "Server returned an invalid response."
        );
      }

      if (
        !response.ok ||
        data.ok === false
      ) {
        throw new Error(
          data.error ||
            "Novara AI request failed."
        );
      }

      /*
        IMPORTANT:
        Normalize every possible
        Cloudflare/API response.
      */

      const ai =
        cleanAIResponse(data);

      if (
        !ai.reply ||
        !ai.reply.trim()
      ) {
        throw new Error(
          "Novara AI returned an empty response."
        );
      }

      /*
        Add clean AI message.
      */

      setMessages(
        (current) => [
          ...current,

          {
            id:
              Date.now() + 1,

            role:
              "ai",

            text:
              ai.reply,

            english:
              ai.english,

            correction:
              ai.correction,

            tip:
              ai.tip,

            score:
              ai.score,

            followUp:
              ai.followUp,
          },
        ]
      );

    } catch (error) {
      console.error(
        "Novara Tutor Error:",
        error
      );

      setMessages(
        (current) => [
          ...current,

          {
            id:
              Date.now() + 1,

            role:
              "ai",

            text:
              "すみません。もう一度試してください。",

            english:
              "Sorry, I couldn't process that request.",

            tip:
              error.message ||
              "Please try again.",
          },
        ]
      );

    } finally {
      setIsThinking(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }

  /* =======================================================
     CLEAR
  ======================================================= */

  function clearChat() {
    if (isThinking) return;

    setMessages([]);
    setInput("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section className="page tutor-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            AI LEARNING LAB
          </div>

          <h1>
            AI Tutor
          </h1>

          <p>
            Ask Novara anything about
            Japanese.
          </p>

        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>

      </div>


      {/* QUICK PROMPTS */}

      <div
        className="question-card"
        style={{
          marginBottom: "18px",
        }}
      >

        <div className="eyebrow">
          QUICK START
        </div>

        <h2>
          What do you want to learn?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(170px,1fr))",
            gap: "9px",
            marginTop: "15px",
          }}
        >

          {quickPrompts.map(
            (item) => (

              <button
                key={item.title}
                className="secondary-button"
                onClick={() =>
                  askTutor(
                    item.prompt
                  )
                }
                disabled={
                  isThinking
                }
                style={{
                  textAlign:
                    "left",
                  padding:
                    "13px",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "21px",
                    marginBottom:
                      "7px",
                  }}
                >
                  {item.icon}
                </div>

                <strong>
                  {item.title}
                </strong>

                <span
                  style={{
                    display:
                      "block",
                    marginTop:
                      "4px",
                    opacity:
                      0.5,
                    fontSize:
                      "11px",
                  }}
                >
                  Ask Novara
                </span>

              </button>

            )
          )}

        </div>

      </div>


      {/* CHAT */}

      <div
        className="question-card"
        style={{
          padding: 0,
          overflow:
            "hidden",
        }}
      >

        {/* CHAT HEADER */}

        <div
          style={{
            padding: "16px",
            borderBottom:
              "1px solid rgba(255,255,255,.07)",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "10px",
          }}
        >

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
            }}
          >

            <div
              style={{
                width: "42px",
                height: "42px",
                flexShrink: 0,
                borderRadius:
                  "50%",
                display:
                  "grid",
                placeItems:
                  "center",
                background:
                  "rgba(124,92,255,.14)",
              }}
            >
              ✦
            </div>

            <div>

              <strong>
                Novara AI
              </strong>

              <div
                style={{
                  fontSize:
                    "11px",
                  opacity:
                    0.45,
                  marginTop:
                    "3px",
                }}
              >
                Japanese Tutor • Online
              </div>

            </div>

          </div>

          <button
            className="secondary-button"
            onClick={
              clearChat
            }
            disabled={
              isThinking
            }
          >
            Clear
          </button>

        </div>


        {/* MESSAGES */}

        <div
          ref={chatRef}
          style={{
            minHeight:
              "360px",
            maxHeight:
              "560px",
            overflowY:
              "auto",
            padding:
              "16px",
            display:
              "flex",
            flexDirection:
              "column",
            gap:
              "14px",
          }}
        >

          {messages.length ===
            0 && (

            <div
              style={{
                minHeight:
                  "300px",
                display:
                  "grid",
                placeItems:
                  "center",
                textAlign:
                  "center",
                opacity:
                  0.6,
                padding:
                  "20px",
              }}
            >

              <div>

                <div
                  style={{
                    fontSize:
                      "34px",
                    marginBottom:
                      "10px",
                  }}
                >
                  ✦
                </div>

                <strong>
                  Ask me anything.
                </strong>

                <p
                  style={{
                    fontSize:
                      "13px",
                    marginTop:
                      "7px",
                    lineHeight:
                      1.5,
                  }}
                >
                  Grammar,
                  vocabulary,
                  translations,
                  pronunciation,
                  JLPT or free
                  conversation.
                </p>

              </div>

            </div>

          )}


          {messages.map(
            (message) => (

              <div
                key={
                  message.id
                }
                style={{
                  display:
                    "flex",
                  justifyContent:
                    message.role ===
                    "user"
                      ? "flex-end"
                      : "flex-start",
                }}
              >

                <div
                  style={{
                    maxWidth:
                      "min(84%, 650px)",
                  }}
                >

                  {/* MESSAGE */}

                  <div
                    style={{
                      padding:
                        "12px 14px",

                      borderRadius:
                        message.role ===
                        "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",

                      background:
                        message.role ===
                        "user"
                          ? "rgba(124,92,255,.16)"
                          : "rgba(255,255,255,.045)",

                      border:
                        "1px solid rgba(255,255,255,.06)",
                    }}
                  >

                    <div
                      style={{
                        fontSize:
                          message.role ===
                          "user"
                            ? "15px"
                            : "17px",

                        lineHeight:
                          1.55,

                        whiteSpace:
                          "pre-wrap",

                        wordBreak:
                          "break-word",
                      }}
                    >
                      {
                        message.text
                      }
                    </div>


                    {/* ENGLISH */}

                    {message.english && (
                      <div
                        style={{
                          marginTop:
                            "9px",
                          paddingTop:
                            "8px",
                          borderTop:
                            "1px solid rgba(255,255,255,.06)",
                          fontSize:
                            "12px",
                          opacity:
                            0.55,
                          lineHeight:
                            1.5,
                        }}
                      >
                        🇬🇧{" "}
                        {
                          message.english
                        }
                      </div>
                    )}

                  </div>


                  {/* AI TOOLS */}

                  {message.role ===
                    "ai" && (

                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap:
                          "7px",
                        marginTop:
                          "6px",
                      }}
                    >

                      <button
                        className="secondary-button"
                        onClick={() =>
                          speak(
                            message.text
                          )
                        }
                        style={{
                          padding:
                            "5px 9px",
                          fontSize:
                            "11px",
                        }}
                      >
                        🔊 Listen
                      </button>

                      {typeof message.score ===
                        "number" && (

                        <span
                          style={{
                            fontSize:
                              "10px",
                            opacity:
                              0.45,
                            alignSelf:
                              "center",
                          }}
                        >
                          Score{" "}
                          {
                            message.score
                          }
                          /100
                        </span>

                      )}

                    </div>

                  )}


                  {/* CORRECTION */}

                  {message.correction && (

                    <div
                      className="path-tip"
                      style={{
                        marginTop:
                          "9px",
                        padding:
                          "10px",
                      }}
                    >

                      <span>
                        ✏️
                      </span>

                      <div>

                        <strong>
                          Correction
                        </strong>

                        <p>
                          {
                            message.correction
                          }
                        </p>

                      </div>

                    </div>

                  )}


                  {/* TIP */}

                  {message.tip && (

                    <div
                      style={{
                        marginTop:
                          "7px",
                        fontSize:
                          "11px",
                        opacity:
                          0.55,
                        lineHeight:
                          1.5,
                      }}
                    >
                      💡{" "}
                      {
                        message.tip
                      }
                    </div>

                  )}


                  {/* FOLLOW UP */}

                  {message.followUp && (

                    <div
                      style={{
                        marginTop:
                          "7px",
                        fontSize:
                          "12px",
                        opacity:
                          0.7,
                      }}
                    >
                      💬{" "}
                      {
                        message.followUp
                      }
                    </div>

                  )}

                </div>

              </div>

            )
          )}


          {/* THINKING */}

          {isThinking && (

            <div
              style={{
                opacity:
                  0.5,
                fontSize:
                  "13px",
              }}
            >
              ✦ Novara is thinking...
            </div>

          )}

        </div>


        {/* INPUT */}

        <div
          style={{
            padding:
              "12px 16px 16px",
            borderTop:
              "1px solid rgba(255,255,255,.07)",
            display:
              "flex",
            gap:
              "8px",
          }}
        >

          <input
            ref={inputRef}
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={(event) => {

              if (
                event.key ===
                  "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                askTutor();
              }

            }}
            placeholder="Ask Novara anything..."
            disabled={
              isThinking
            }
            style={{
              flex: 1,
              minWidth: 0,
              padding:
                "12px 13px",
              borderRadius:
                "12px",
              border:
                "1px solid rgba(255,255,255,.1)",
              background:
                "rgba(255,255,255,.035)",
              color:
                "inherit",
              outline:
                "none",
              fontSize:
                "15px",
              fontFamily:
                "inherit",
            }}
          />

          <button
            className="primary-button"
            onClick={() =>
              askTutor()
            }
            disabled={
              !input.trim() ||
              isThinking
            }
          >
            {isThinking
              ? "..."
              : "Ask →"}
          </button>

        </div>

      </div>


      {/* TIP */}

      <div
        className="path-tip"
        style={{
          marginTop:
            "18px",
        }}
      >

        <span>
          🧠
        </span>

        <div>

          <strong>
            Learn through conversation
          </strong>

          <p>
            Novara can explain grammar,
            translate sentences,
            correct Japanese,
            teach vocabulary and
            continue a conversation.
          </p>

        </div>

      </div>

    </section>
  );
}