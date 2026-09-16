import React, { useEffect, useRef, useState } from "react";

const scenarios = [
  {
    id: "cafe",
    icon: "☕",
    title: "At a Café",
    subtitle: "Order a drink and food",
    level: "Beginner",
    starter: "こんにちは！何を注文しますか？",
    starterEnglish: "Hello! What would you like to order?",
  },
  {
    id: "intro",
    icon: "👋",
    title: "Meeting Someone",
    subtitle: "Introduce yourself",
    level: "Beginner",
    starter: "こんにちは。はじめまして。お名前は何ですか？",
    starterEnglish: "Hello! Nice to meet you. What's your name?",
  },
  {
    id: "shopping",
    icon: "🛍️",
    title: "Shopping",
    subtitle: "Ask about products and prices",
    level: "Beginner",
    starter: "いらっしゃいませ。何をお探しですか？",
    starterEnglish: "Welcome! What are you looking for?",
  },
  {
    id: "travel",
    icon: "🚆",
    title: "Travel",
    subtitle: "Ask for directions",
    level: "Beginner",
    starter: "こんにちは。どこへ行きたいですか？",
    starterEnglish: "Hello. Where would you like to go?",
  },
];

const starterSuggestions = [
  "こんにちは",
  "わたしは学生です",
  "コーヒーをください",
  "これはいくらですか？",
];

function speak(text) {
  if (!window.speechSynthesis || !text) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "ja-JP";
  utterance.rate = 0.82;

  window.speechSynthesis.speak(utterance);
}

export default function Conversation() {
  const [scenario, setScenario] = useState(scenarios[0]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      japanese: scenarios[0].starter,
      english: scenarios[0].starterEnglish,
      score: null,
      correction: null,
    },
  ]);

  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [sessionXP, setSessionXP] = useState(0);

  const [mistakes, setMistakes] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function changeScenario(nextScenario) {
    setScenario(nextScenario);

    setMessages([
      {
        id: Date.now(),
        role: "ai",
        japanese: nextScenario.starter,
        english: nextScenario.starterEnglish,
        score: null,
        correction: null,
      },
    ]);

    setInput("");
    setMistakes(0);
    setSessionXP(0);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }

  async function sendMessage(customText) {
    const text =
      typeof customText === "string"
        ? customText
        : input;

    if (!text.trim() || isTyping) {
      return;
    }

    const cleanText = text.trim();

    const userMessage = {
      id: Date.now(),
      role: "user",
      japanese: cleanText,
      english: null,
      score: null,
      correction: null,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: cleanText,
            scenario: scenario.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.error ||
            `AI request failed: ${response.status}`
        );
      }

      const score =
        typeof data.score === "number"
          ? data.score
          : 80;

      const aiMessage = {
        id: Date.now() + 1,
        role: "ai",
        japanese:
          data.japanese ||
          "すみません。もう一度お願いします。",
        english:
          data.english ||
          "Sorry, please try again.",
        score: score,
        correction:
          data.correction || null,
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);

      const earnedXP = Math.round(score / 10);

      setSessionXP(
        (previous) => previous + earnedXP
      );

      if (data.correction) {
        setMistakes(
          (previous) => previous + 1
        );
      }

    } catch (error) {
      console.error(
        "Novara AI Error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "ai",
          japanese:
            "すみません。AIサーバーに接続できませんでした。",
          english:
            "Sorry. I couldn't connect to the AI server.",
          score: 0,
          correction: null,
        },
      ]);
    } finally {
      setIsTyping(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }

  function endSession() {
    const totalUserMessages =
      messages.filter(
        (message) =>
          message.role === "user"
      ).length;

    const accuracy =
      totalUserMessages === 0
        ? 0
        : Math.max(
            0,
            Math.round(
              ((totalUserMessages - mistakes) /
                totalUserMessages) *
                100
            )
          );

    alert(
      `Session complete!\n\nXP earned: +${sessionXP}\nAccuracy: ${accuracy}%\nCorrections: ${mistakes}`
    );
  }

  const userMessages =
    messages.filter(
      (message) =>
        message.role === "user"
    ).length;

  const accuracy =
    userMessages === 0
      ? "--"
      : `${Math.max(
          0,
          Math.round(
            ((userMessages - mistakes) /
              userMessages) *
              100
          )
        )}%`;

  return (
    <section className="page conversation-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <div className="eyebrow">
            AI SPEAKING LAB
          </div>

          <h1>
            AI Conversation
          </h1>

          <p>
            Practice real-world Japanese
            conversations with Novara.
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
            "repeat(auto-fit,minmax(160px,1fr))",
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
            {userMessages}
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

        <div className="result-card">
          <strong>
            {mistakes}
          </strong>

          <span>
            Corrections
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
              "repeat(auto-fit,minmax(190px,1fr))",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          {scenarios.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                changeScenario(item)
              }
              className="secondary-button"
              style={{
                textAlign: "left",
                padding: "15px",
                border:
                  scenario.id === item.id
                    ? "1px solid rgba(124,92,255,.7)"
                    : undefined,
              }}
            >
              <div
                style={{
                  fontSize: "25px",
                  marginBottom: "8px",
                }}
              >
                {item.icon}
              </div>

              <strong
                style={{
                  display: "block",
                }}
              >
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

              <span
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "10px",
                  opacity: 0.4,
                }}
              >
                {item.level}
              </span>
            </button>
          ))}
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

        {/* CHAT HEADER */}

        <div
          style={{
            padding: "18px",
            borderBottom:
              "1px solid rgba(255,255,255,.07)",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background:
                  "rgba(124,92,255,.14)",
                fontSize: "21px",
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
                  fontSize: "11px",
                  opacity: 0.45,
                  marginTop: "3px",
                }}
              >
                {scenario.title} • Online
              </div>
            </div>
          </div>

          <button
            className="secondary-button"
            onClick={endSession}
          >
            Finish
          </button>
        </div>

        {/* MESSAGES */}

        <div
          style={{
            minHeight: "390px",
            maxHeight: "520px",
            overflowY: "auto",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent:
                  message.role === "user"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "78%",
                }}
              >

                {/* MESSAGE BUBBLE */}

                <div
                  style={{
                    padding: "13px 15px",
                    borderRadius:
                      message.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      message.role === "user"
                        ? "rgba(124,92,255,.16)"
                        : "rgba(255,255,255,.045)",
                    border:
                      "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      lineHeight: 1.55,
                    }}
                  >
                    {message.japanese}
                  </div>

                  {message.english && (
                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "12px",
                        opacity: 0.48,
                        lineHeight: 1.5,
                      }}
                    >
                      {message.english}
                    </div>
                  )}
                </div>

                {/* AI CONTROLS */}

                {message.role === "ai" &&
                  message.japanese && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
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
                          padding: "5px 9px",
                          fontSize: "11px",
                        }}
                      >
                        🔊 Listen
                      </button>

                      {message.score !==
                        null && (
                        <span
                          style={{
                            fontSize: "10px",
                            opacity: 0.4,
                          }}
                        >
                          +
                          {Math.round(
                            message.score / 10
                          )}{" "}
                          XP
                        </span>
                      )}
                    </div>
                  )}

                {/* CORRECTION */}

                {message.correction && (
                  <div
                    className="path-tip"
                    style={{
                      marginTop: "9px",
                      padding: "11px",
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
                        {message.correction}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* TYPING */}

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

        {/* SUGGESTIONS */}

        <div
          style={{
            padding: "0 18px 12px",
            display: "flex",
            gap: "7px",
            overflowX: "auto",
          }}
        >
          {starterSuggestions.map(
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
                  whiteSpace: "nowrap",
                  padding: "7px 10px",
                  fontSize: "11px",
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
            padding: "12px 18px 18px",
            borderTop:
              "1px solid rgba(255,255,255,.07)",
            display: "flex",
            gap: "9px",
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
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type in Japanese..."
            disabled={isTyping}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "13px 14px",
              borderRadius: "12px",
              border:
                "1px solid rgba(255,255,255,.1)",
              background:
                "rgba(255,255,255,.035)",
              color: "inherit",
              outline: "none",
              fontSize: "15px",
              fontFamily: "inherit",
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
              ? "Thinking..."
              : "Send →"}
          </button>
        </div>
      </div>

      {/* TIP */}

      <div
        className="path-tip"
        style={{
          marginTop: "18px",
        }}
      >
        <span>
          🧠
        </span>

        <div>
          <strong>
            Speak, don't memorize
          </strong>

          <p>
            Try answering in Japanese even
            when you're unsure. Novara will
            help you understand and correct
            your mistakes.
          </p>
        </div>
      </div>
    </section>
  );
}