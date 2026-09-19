import React, {
  useEffect,
  useRef,
  useState,
} from "react";

const scenarios = [
  {
    id: "cafe",
    icon: "☕",
    title: "At a Café",
    subtitle: "Order food and drinks",
    level: "Beginner",
    starter:
      "こんにちは！何を注文しますか？",
    english:
      "Hello! What would you like to order?",
  },

  {
    id: "intro",
    icon: "👋",
    title: "Meeting Someone",
    subtitle: "Introduce yourself",
    level: "Beginner",
    starter:
      "こんにちは！はじめまして。お名前は何ですか？",
    english:
      "Hello! Nice to meet you. What's your name?",
  },

  {
    id: "shopping",
    icon: "🛍️",
    title: "Shopping",
    subtitle: "Products and prices",
    level: "Beginner",
    starter:
      "いらっしゃいませ！何をお探しですか？",
    english:
      "Welcome! What are you looking for?",
  },

  {
    id: "travel",
    icon: "🚆",
    title: "Travel",
    subtitle: "Directions and transport",
    level: "Beginner",
    starter:
      "こんにちは。どこへ行きたいですか？",
    english:
      "Hello. Where would you like to go?",
  },
];

const suggestions = [
  "こんにちは！",
  "私はジャティンです。",
  "コーヒーをください。",
  "これはいくらですか？",
];

function speak(text) {
  if (
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

  window.speechSynthesis.speak(
    utterance
  );
}

function convertMessages(messages) {
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
        message.japanese || "",
    }));
}

export default function Conversation() {
  const [scenario, setScenario] =
    useState(scenarios[0]);

  const [messages, setMessages] =
    useState([
      {
        id: 1,
        role: "ai",
        japanese:
          scenarios[0].starter,
        english:
          scenarios[0].english,
        score: null,
        correction: null,
        tip: null,
      },
    ]);

  const [input, setInput] =
    useState("");

  const [isTyping, setIsTyping] =
    useState(false);

  const [sessionXP, setSessionXP] =
    useState(0);

  const [mistakes, setMistakes] =
    useState(0);

  const inputRef =
    useRef(null);

  const chatRef =
    useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  function changeScenario(next) {
    setScenario(next);

    setMessages([
      {
        id: Date.now(),
        role: "ai",
        japanese: next.starter,
        english: next.english,
        score: null,
        correction: null,
        tip: null,
      },
    ]);

    setInput("");
    setSessionXP(0);
    setMistakes(0);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }

  async function sendMessage(customText) {
    const text =
      typeof customText === "string"
        ? customText
        : input;

    const cleanText =
      text.trim();

    if (
      !cleanText ||
      isTyping
    ) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      japanese: cleanText,
      english: null,
      score: null,
      correction: null,
      tip: null,
    };

    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response =
        await fetch("/api/chat", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: cleanText,

            scenario:
              scenario.id,

            mode:
              "conversation",

            messages:
              convertMessages(
                messages
              ),
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "AI request failed"
        );
      }

      const score =
        typeof data.score ===
        "number"
          ? data.score
          : null;

      const aiMessage = {
        id:
          Date.now() + 1,

        role: "ai",

        japanese:
          data.reply ||
          data.japanese ||
          "もう一度言ってみてください。",

        english:
          data.english || "",

        score,

        correction:
          data.correction ||
          null,

        tip:
          data.tip ||
          null,

        followUp:
          data.followUp ||
          null,
      };

      setMessages(
        (previous) => [
          ...previous,
          aiMessage,
        ]
      );

      if (
        typeof score === "number"
      ) {
        setSessionXP(
          (previous) =>
            previous +
            Math.max(
              1,
              Math.round(
                score / 10
              )
            )
        );
      }

      if (data.correction) {
        setMistakes(
          (previous) =>
            previous + 1
        );
      }

    } catch (error) {
      console.error(
        "Novara AI Error:",
        error
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            role: "ai",

            japanese:
              "すみません。もう一度試してください。",

            english:
              "Sorry. I couldn't process that request.",

            score: null,
            correction: null,

            tip:
              error.message ||
              "Please try again.",
          },
        ]
      );

    } finally {
      setIsTyping(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }

  function finishSession() {
    const userMessages =
      messages.filter(
        (message) =>
          message.role === "user"
      ).length;

    const accuracy =
      userMessages === 0
        ? 0
        : Math.max(
            0,
            Math.round(
              ((userMessages -
                mistakes) /
                userMessages) *
                100
            )
          );

    alert(
      `Session complete!\n\nXP earned: +${sessionXP}\nAccuracy: ${accuracy}%\nCorrections: ${mistakes}`
    );
  }

  const userCount =
    messages.filter(
      (message) =>
        message.role === "user"
    ).length;

  const accuracy =
    userCount === 0
      ? "--"
      : `${Math.max(
          0,
          Math.round(
            ((userCount -
              mistakes) /
              userCount) *
              100
          )
        )}%`;

  return (
    <section className="page conversation-page">

      <div className="page-header">
        <div>
          <div className="eyebrow">
            AI SPEAKING LAB
          </div>

          <h1>
            AI Conversation
          </h1>

          <p>
            Have a real Japanese
            conversation with Novara.
          </p>
        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>
      </div>

      {/* STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(140px,1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <div className="result-card">
          <strong>
            +{sessionXP}
          </strong>
          <span>
            Session XP
          </span>
        </div>

        <div className="result-card">
          <strong>
            {userCount}
          </strong>
          <span>
            Messages
          </span>
        </div>

        <div className="result-card">
          <strong>
            {accuracy}
          </strong>
          <span>
            Accuracy
          </span>
        </div>
      </div>

      {/* SCENARIOS */}

      <div
        className="question-card"
        style={{
          marginBottom: "18px",
        }}
      >
        <div className="eyebrow">
          CHOOSE A SCENARIO
        </div>

        <h2>
          Where do you want to practice?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          {scenarios.map(
            (item) => (
              <button
                key={item.id}
                onClick={() =>
                  changeScenario(item)
                }
                className="secondary-button"
                style={{
                  textAlign: "left",
                  padding: "14px",

                  border:
                    scenario.id ===
                    item.id
                      ? "1px solid rgba(124,92,255,.7)"
                      : undefined,
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    marginBottom: "7px",
                  }}
                >
                  {item.icon}
                </div>

                <strong>
                  {item.title}
                </strong>

                <span
                  style={{
                    display: "block",
                    opacity: 0.55,
                    marginTop: "4px",
                    fontSize: "12px",
                  }}
                >
                  {item.subtitle}
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
          overflow: "hidden",
        }}
      >

        {/* HEADER */}

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
              alignItems: "center",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                flexShrink: 0,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background:
                  "rgba(124,92,255,.14)",
              }}
            >
              ✦
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <strong>
                Novara AI
              </strong>

              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.45,
                  marginTop: "3px",
                }}
              >
                {scenario.title}
                {" • "}
                Online
              </div>
            </div>
          </div>

          <button
            className="secondary-button"
            onClick={
              finishSession
            }
          >
            Finish
          </button>
        </div>

        {/* MESSAGES */}

        <div
          ref={chatRef}
          style={{
            minHeight: "380px",
            maxHeight: "540px",
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {messages.map(
            (message) => (
              <div
                key={message.id}
                style={{
                  display: "flex",
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
                      "min(82%, 620px)",
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
                            ? "16px"
                            : "18px",
                        lineHeight: 1.55,
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {
                        message.japanese
                      }
                    </div>

                    {message.english && (
                      <div
                        style={{
                          marginTop: "7px",
                          fontSize: "12px",
                          opacity: 0.55,
                          lineHeight: 1.5,
                        }}
                      >
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
                        display: "flex",
                        flexWrap:
                          "wrap",
                        alignItems:
                          "center",
                        gap: "7px",
                        marginTop: "6px",
                      }}
                    >
                      <button
                        className="secondary-button"
                        onClick={() =>
                          speak(
                            message.japanese
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
                            opacity: 0.45,
                          }}
                        >
                          Score{" "}
                          {
                            message.score
                          }
                        </span>
                      )}
                    </div>
                  )}

                  {message.correction && (
                    <div
                      className="path-tip"
                      style={{
                        marginTop: "9px",
                        padding: "10px",
                      }}
                    >
                      <span>
                        💡
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
                        marginTop: "7px",
                        fontSize: "11px",
                        opacity: 0.55,
                      }}
                    >
                      💡 {message.tip}
                    </div>
                  )}

                  {message.followUp && (
                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "12px",
                        opacity: 0.7,
                      }}
                    >
                      {message.followUp}
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {isTyping && (
            <div
              style={{
                opacity: 0.5,
                fontSize: "13px",
              }}
            >
              ✦ Novara is thinking...
            </div>
          )}
        </div>

        {/* QUICK SUGGESTIONS */}

        <div
          style={{
            padding:
              "0 16px 12px",
            display: "flex",
            gap: "7px",
            overflowX: "auto",
            scrollbarWidth:
              "none",
          }}
        >
          {suggestions.map(
            (suggestion) => (
              <button
                key={suggestion}
                className="secondary-button"
                onClick={() =>
                  sendMessage(
                    suggestion
                  )
                }
                disabled={isTyping}
                style={{
                  flexShrink: 0,
                  fontSize: "11px",
                  padding:
                    "7px 10px",
                }}
              >
                {suggestion}
              </button>
            )
          )}
        </div>

        {/* INPUT */}

        <div
          style={{
            padding:
              "12px 16px 16px",
            borderTop:
              "1px solid rgba(255,255,255,.07)",
            display: "flex",
            gap: "8px",
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
                "Enter"
              ) {
                sendMessage();
              }
            }}
            placeholder="Talk to Novara in Japanese..."
            disabled={isTyping}
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
              color: "inherit",
              outline: "none",
              fontSize: "15px",
              fontFamily:
                "inherit",
            }}
          />

          <button
            className="primary-button"
            onClick={() =>
              sendMessage()
            }
            disabled={
              !input.trim() ||
              isTyping
            }
          >
            {isTyping
              ? "..."
              : "Send →"}
          </button>
        </div>
      </div>

      <div
        className="path-tip"
        style={{
          marginTop: "18px",
        }}
      >
        <span>🧠</span>

        <div>
          <strong>
            Speak naturally
          </strong>

          <p>
            Ask Novara anything about
            Japanese. It remembers the
            recent conversation and can
            explain, correct, translate
            and continue the dialogue.
          </p>
        </div>
      </div>
    </section>
  );
}