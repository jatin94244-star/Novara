import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNovaraStore } from "../store/useNovaraStore";

const LANGUAGE_DATA = {
  japanese: {
    name: "Japanese",
    flag: "🇯🇵",
    speech: "ja-JP",
  },
  english: {
    name: "English",
    flag: "🇬🇧",
    speech: "en-US",
  },
  korean: {
    name: "Korean",
    flag: "🇰🇷",
    speech: "ko-KR",
  },
  spanish: {
    name: "Spanish",
    flag: "🇪🇸",
    speech: "es-ES",
  },
  french: {
    name: "French",
    flag: "🇫🇷",
    speech: "fr-FR",
  },
  german: {
    name: "German",
    flag: "🇩🇪",
    speech: "de-DE",
  },
  mandarin: {
    name: "Mandarin",
    flag: "🇨🇳",
    speech: "zh-CN",
  },
  italian: {
    name: "Italian",
    flag: "🇮🇹",
    speech: "it-IT",
  },
};

const QUICK_PROMPTS = {
  japanese: [
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
        "Explain an important Japanese grammar concept for beginners.",
    },
    {
      icon: "🎯",
      title: "JLPT N5",
      prompt:
        "Give me one JLPT N5 Japanese question and wait for my answer.",
    },
  ],

  english: [
    {
      icon: "👋",
      title: "Greetings",
      prompt:
        "Teach me common English greetings for beginners.",
    },
    {
      icon: "🙋",
      title: "Introduce myself",
      prompt:
        "Teach me how to introduce myself in English.",
    },
    {
      icon: "🍽️",
      title: "Food",
      prompt:
        "Teach me useful English phrases for ordering food.",
    },
    {
      icon: "✈️",
      title: "Travel",
      prompt:
        "Teach me useful English phrases for travelling.",
    },
    {
      icon: "📚",
      title: "Grammar",
      prompt:
        "Explain an important English grammar concept for beginners.",
    },
    {
      icon: "🎯",
      title: "Practice",
      prompt:
        "Give me one beginner English question and wait for my answer.",
    },
  ],

  korean: [
    {
      icon: "👋",
      title: "Greetings",
      prompt:
        "Teach me common Korean greetings for beginners.",
    },
    {
      icon: "🙋",
      title: "Introduce myself",
      prompt:
        "Teach me how to introduce myself in Korean.",
    },
    {
      icon: "🍜",
      title: "Food",
      prompt:
        "Teach me useful Korean phrases for ordering food.",
    },
    {
      icon: "🚆",
      title: "Travel",
      prompt:
        "Teach me useful Korean phrases for travelling.",
    },
    {
      icon: "📚",
      title: "Grammar",
      prompt:
        "Explain an important Korean grammar concept for beginners.",
    },
    {
      icon: "🎯",
      title: "Practice",
      prompt:
        "Give me one beginner Korean question and wait for my answer.",
    },
  ],

  spanish: [
    {
      icon: "👋",
      title: "Greetings",
      prompt:
        "Teach me common Spanish greetings for beginners.",
    },
    {
      icon: "🙋",
      title: "Introduce myself",
      prompt:
        "Teach me how to introduce myself in Spanish.",
    },
    {
      icon: "🍽️",
      title: "Food",
      prompt:
        "Teach me useful Spanish phrases for ordering food.",
    },
    {
      icon: "✈️",
      title: "Travel",
      prompt:
        "Teach me useful Spanish phrases for travelling.",
    },
    {
      icon: "📚",
      title: "Grammar",
      prompt:
        "Explain an important Spanish grammar concept for beginners.",
    },
    {
      icon: "🎯",
      title: "Practice",
      prompt:
        "Give me one beginner Spanish question and wait for my answer.",
    },
  ],

  french: [
    {
      icon: "👋",
      title: "Greetings",
      prompt:
        "Teach me common French greetings for beginners.",
    },
    {
      icon: "🙋",
      title: "Introduce myself",
      prompt:
        "Teach me how to introduce myself in French.",
    },
    {
      icon: "🥐",
      title: "Food",
      prompt:
        "Teach me useful French phrases for ordering food.",
    },
    {
      icon: "✈️",
      title: "Travel",
      prompt:
        "Teach me useful French phrases for travelling.",
    },
    {
      icon: "📚",
      title: "Grammar",
      prompt:
        "Explain an important French grammar concept for beginners.",
    },
    {
      icon: "🎯",
      title: "Practice",
      prompt:
        "Give me one beginner French question and wait for my answer.",
    },
  ],

  german: [
    {
      icon: "👋",
      title: "Greetings",
      prompt:
        "Teach me common German greetings for beginners.",
    },
    {
      icon: "🙋",
      title: "Introduce myself",
      prompt:
        "Teach me how to introduce myself in German.",
    },
    {
      icon: "🍽️",
      title: "Food",
      prompt:
        "Teach me useful German phrases for ordering food.",
    },
    {
      icon: "🚆",
      title: "Travel",
      prompt:
        "Teach me useful German phrases for travelling.",
    },
    {
      icon: "📚",
      title: "Grammar",
      prompt:
        "Explain an important German grammar concept for beginners.",
    },
    {
      icon: "🎯",
      title: "Practice",
      prompt:
        "Give me one beginner German question and wait for my answer.",
    },
  ],

  mandarin: [
    {
      icon: "👋",
      title: "Greetings",
      prompt:
        "Teach me common Mandarin greetings for beginners.",
    },
    {
      icon: "🙋",
      title: "Introduce myself",
      prompt:
        "Teach me how to introduce myself in Mandarin.",
    },
    {
      icon: "🍜",
      title: "Food",
      prompt:
        "Teach me useful Mandarin phrases for ordering food.",
    },
    {
      icon: "🚆",
      title: "Travel",
      prompt:
        "Teach me useful Mandarin phrases for travelling.",
    },
    {
      icon: "📚",
      title: "Grammar",
      prompt:
        "Explain an important Mandarin grammar concept for beginners.",
    },
    {
      icon: "🎯",
      title: "Practice",
      prompt:
        "Give me one beginner Mandarin question and wait for my answer.",
    },
  ],

  italian: [
    {
      icon: "👋",
      title: "Greetings",
      prompt:
        "Teach me common Italian greetings for beginners.",
    },
    {
      icon: "🙋",
      title: "Introduce myself",
      prompt:
        "Teach me how to introduce myself in Italian.",
    },
    {
      icon: "🍝",
      title: "Food",
      prompt:
        "Teach me useful Italian phrases for ordering food.",
    },
    {
      icon: "🚆",
      title: "Travel",
      prompt:
        "Teach me useful Italian phrases for travelling.",
    },
    {
      icon: "📚",
      title: "Grammar",
      prompt:
        "Explain an important Italian grammar concept for beginners.",
    },
    {
      icon: "🎯",
      title: "Practice",
      prompt:
        "Give me one beginner Italian question and wait for my answer.",
    },
  ],
};

function speak(text, languageCode) {
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

  utterance.lang = languageCode;
  utterance.rate = 0.82;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

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

function tryParseJSON(value) {
  if (typeof value !== "string") {
    return value;
  }

  let text = value.trim();

  if (!text) {
    return value;
  }

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

function cleanAIResponse(data) {
  let value = data;

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

  if (typeof value === "string") {
    const parsed = tryParseJSON(value);

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      value = parsed;
    }
  }

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

export default function Tutor() {
  const { state } = useNovaraStore();

  /*
    Profile uses IDs like:
    japanese, korean, spanish...

    Store may contain either ID or old
    display-name format, so normalize it.
  */

  const rawActiveLanguage =
    state?.activeLanguage || "japanese";

  const activeLanguageId =
    String(rawActiveLanguage).toLowerCase();

  const language =
    LANGUAGE_DATA[activeLanguageId] ||
    LANGUAGE_DATA.japanese;

  const quickPrompts =
    QUICK_PROMPTS[activeLanguageId] ||
    QUICK_PROMPTS.japanese;

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

              language:
                language.name,

              languageId:
                activeLanguageId,

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

      setMessages(
        (current) => [
          ...current,
          {
            id:
              Date.now() + 1,
            role: "ai",
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
            role: "ai",
            text:
              `Sorry, I couldn't process that request.`,
            english: "",
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

  function clearChat() {
    if (isThinking) return;

    setMessages([]);
    setInput("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  return (
    <section className="page tutor-page">

      <div className="page-header">
        <div>
          <div className="eyebrow">
            AI LEARNING LAB
          </div>

          <h1>
            AI Tutor
          </h1>

          <p>
            Ask Novara anything about{" "}
            {language.name}.
          </p>
        </div>

        <div className="language-pill">
          {language.flag}{" "}
          {language.name}
        </div>
      </div>

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
                disabled={isThinking}
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

      <div
        className="question-card"
        style={{
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom:
              "1px solid rgba(255,255,255,.07)",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
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
                display: "grid",
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
                {language.name} Tutor • Online
              </div>
            </div>
          </div>

          <button
            className="secondary-button"
            onClick={clearChat}
            disabled={isThinking}
          >
            Clear
          </button>
        </div>

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
          {messages.length === 0 && (
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
                  Grammar, vocabulary,
                  translations,
                  pronunciation,
                  practice or free
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
                            message.text,
                            language.speech
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
            placeholder={`Ask Novara about ${language.name}...`}
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
            Novara is currently teaching{" "}
            {language.name}. Change your
            active language from Profile
            to switch the Tutor.
          </p>
        </div>
      </div>

    </section>
  );
}