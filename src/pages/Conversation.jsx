import React, { useState } from "react";

const scenarios = [
  {
    id: "cafe",
    icon: "🍜",
    title: "At a Café",
    description: "Order food and drinks in Japanese.",
    level: "Beginner",
  },
  {
    id: "introduction",
    icon: "👋",
    title: "Meet Someone",
    description: "Introduce yourself to a new person.",
    level: "Beginner",
  },
  {
    id: "shopping",
    icon: "🛍️",
    title: "Shopping",
    description: "Ask about prices and products.",
    level: "Beginner",
  },
  {
    id: "travel",
    icon: "🚆",
    title: "Train Station",
    description: "Ask for directions and tickets.",
    level: "Intermediate",
  },
];

const scenarioReplies = {
  cafe: {
    start:
      "いらっしゃいませ！ What would you like to order?",
    translation:
      "Welcome! What would you like to order?",
    suggestions: [
      "コーヒーをください。",
      "水をください。",
      "ラーメンをください。",
    ],
  },

  introduction: {
    start:
      "こんにちは！ はじめまして。お名前は何ですか？",
    translation:
      "Hello! Nice to meet you. What is your name?",
    suggestions: [
      "わたしは Jatin です。",
      "はじめまして。",
      "インドから来ました。",
    ],
  },

  shopping: {
    start:
      "こんにちは！ 何を探していますか？",
    translation:
      "Hello! What are you looking for?",
    suggestions: [
      "これはいくらですか？",
      "これをください。",
      "ちょっと高いです。",
    ],
  },

  travel: {
    start:
      "すみません。どこへ行きたいですか？",
    translation:
      "Excuse me. Where would you like to go?",
    suggestions: [
      "東京駅へ行きたいです。",
      "駅はどこですか？",
      "切符をください。",
    ],
  },
};

function speakJapanese(text) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "ja-JP";
  utterance.rate = 0.8;

  window.speechSynthesis.speak(
    utterance
  );
}

function getReply(scenario, message) {
  const text = message.toLowerCase();

  if (scenario === "cafe") {
    if (
      text.includes("コーヒー") ||
      text.includes("coffee")
    ) {
      return {
        japanese:
          "はい、コーヒーですね。少々お待ちください。",
        english:
          "Sure, one coffee. Please wait a moment.",
      };
    }

    if (
      text.includes("水") ||
      text.includes("water")
    ) {
      return {
        japanese:
          "はい、お水ですね。",
        english:
          "Sure, some water.",
      };
    }

    return {
      japanese:
        "ありがとうございます！ ご注文は以上ですか？",
      english:
        "Thank you! Is that everything?",
    };
  }

  if (scenario === "introduction") {
    if (
      text.includes("jatin") ||
      text.includes("ジャティン")
    ) {
      return {
        japanese:
          "はじめまして、Jatinさん！ よろしくお願いします。",
        english:
          "Nice to meet you, Jatin! I look forward to getting to know you.",
      };
    }

    if (
      text.includes("インド") ||
      text.includes("india")
    ) {
      return {
        japanese:
          "そうですか！ インドから来たんですね。",
        english:
          "I see! You came from India.",
      };
    }

    return {
      japanese:
        "いいですね！ もう少し自己紹介してみましょう。",
      english:
        "Nice! Let's introduce yourself a little more.",
    };
  }

  if (scenario === "shopping") {
    if (
      text.includes("いくら") ||
      text.includes("price") ||
      text.includes("how much")
    ) {
      return {
        japanese:
          "これは1,000円です。",
        english:
          "This is 1,000 yen.",
      };
    }

    if (
      text.includes("ください") ||
      text.includes("buy")
    ) {
      return {
        japanese:
          "ありがとうございます。こちらの商品ですね。",
        english:
          "Thank you. This product, right?",
      };
    }

    return {
      japanese:
        "もちろんです。何かお探しですか？",
      english:
        "Of course. Are you looking for something?",
    };
  }

  if (scenario === "travel") {
    if (
      text.includes("駅") ||
      text.includes("station")
    ) {
      return {
        japanese:
          "駅はあそこです。まっすぐ行ってください。",
        english:
          "The station is over there. Go straight.",
      };
    }

    if (
      text.includes("東京") ||
      text.includes("tokyo")
    ) {
      return {
        japanese:
          "東京駅ですね。こちらの電車に乗ってください。",
        english:
          "Tokyo Station. Please take this train.",
      };
    }

    return {
      japanese:
        "わかりました。もう一度言ってみてください。",
      english:
        "Got it. Try saying it one more time.",
    };
  }

  return {
    japanese:
      "いいですね！ その調子です。",
    english:
      "Great! Keep going!",
  };
}

export default function Conversation({
  state,
}) {
  const [scenario, setScenario] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [showTranslation, setShowTranslation] =
    useState(true);

  const [isThinking, setIsThinking] =
    useState(false);

  const [sessionXP, setSessionXP] =
    useState(0);

  const [mistakes, setMistakes] =
    useState(0);

  function startScenario(selectedScenario) {
    const data =
      scenarioReplies[selectedScenario.id];

    setScenario(selectedScenario.id);

    setMessages([
      {
        id: Date.now(),
        role: "ai",
        japanese: data.start,
        english: data.translation,
      },
    ]);

    setInput("");
    setSessionXP(0);
    setMistakes(0);
  }

  function sendMessage(customText) {
    const text =
      typeof customText === "string"
        ? customText.trim()
        : input.trim();

    if (!text || isThinking || !scenario) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      japanese: text,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const reply =
        getReply(scenario, text);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "ai",
          japanese: reply.japanese,
          english: reply.english,
        },
      ]);

      setSessionXP(
        (previous) => previous + 10
      );

      setIsThinking(false);
    }, 650);
  }

  function endConversation() {
    setScenario(null);
    setMessages([]);
    setInput("");
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  if (!scenario) {
    return (
      <section className="page conversation-page">

        <div className="page-header">

          <div>
            <div className="eyebrow">
              IMMERSIVE PRACTICE
            </div>

            <h1>
              AI Conversation
            </h1>

            <p>
              Practice Japanese in realistic
              everyday situations.
            </p>
          </div>

          <div className="language-pill">
            🇯🇵 Japanese
          </div>

        </div>

        <div
          className="question-card"
          style={{
            marginBottom: "20px",
          }}
        >

          <div className="eyebrow">
            HOW IT WORKS
          </div>

          <h2>
            Speak. Practice. Improve.
          </h2>

          <p
            style={{
              opacity: 0.6,
              maxWidth: "700px",
              lineHeight: 1.7,
            }}
          >
            Choose a situation and have a
            simulated conversation in Japanese.
            You can listen to pronunciation and
            reveal English translations whenever
            you need help.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(150px,1fr))",
              gap: "12px",
              marginTop: "20px",
            }}
          >

            <MiniFeature
              icon="💬"
              title="Talk"
              text="Natural practice"
            />

            <MiniFeature
              icon="🔊"
              title="Listen"
              text="Japanese audio"
            />

            <MiniFeature
              icon="💡"
              title="Learn"
              text="Instant guidance"
            />

            <MiniFeature
              icon="✦"
              title="Earn"
              text="XP for practice"
            />

          </div>

        </div>

        <div className="eyebrow">
          CHOOSE A SCENARIO
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(240px,1fr))",
            gap: "16px",
            marginTop: "12px",
          }}
        >

          {scenarios.map((item) => (

            <button
              key={item.id}
              onClick={() =>
                startScenario(item)
              }
              style={{
                textAlign: "left",
                border:
                  "1px solid rgba(255,255,255,.08)",
                background:
                  "rgba(255,255,255,.035)",
                color: "inherit",
                borderRadius: "16px",
                padding: "20px",
                cursor: "pointer",
                transition:
                  "transform .2s ease, background .2s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                  "translateY(-3px)";
                event.currentTarget.style.background =
                  "rgba(124,92,255,.09)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                  "translateY(0)";
                event.currentTarget.style.background =
                  "rgba(255,255,255,.035)";
              }}
            >

              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "15px",
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.5,
                  marginBottom: "5px",
                  textTransform:
                    "uppercase",
                }}
              >
                {item.level}
              </div>

              <h3
                style={{
                  margin: "0 0 7px",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  opacity: 0.55,
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {item.description}
              </p>

              <div
                style={{
                  marginTop: "18px",
                  fontSize: "13px",
                }}
              >
                Start practice →
              </div>

            </button>

          ))}

        </div>

      </section>
    );
  }

  const currentScenario =
    scenarios.find(
      (item) => item.id === scenario
    );

  const suggestions =
    scenarioReplies[scenario].suggestions;

  return (
    <section className="page conversation-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <button
            className="back-button"
            onClick={endConversation}
          >
            ← Scenarios
          </button>

          <div
            className="eyebrow"
            style={{
              marginTop: "12px",
            }}
          >
            LIVE PRACTICE
          </div>

          <h1>
            {currentScenario.title}
          </h1>

          <p>
            {currentScenario.description}
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >

          <div className="language-pill">
            🇯🇵 Japanese
          </div>

          <div className="xp-badge">
            ✦ +{sessionXP} XP
          </div>

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

        {/* CHAT BAR */}

        <div
          style={{
            padding: "16px 20px",
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >

          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg,#7c5cff,#4f46e5)",
            }}
          >
            🤖
          </div>

          <div style={{ flex: 1 }}>

            <strong>
              Novara AI
            </strong>

            <div
              style={{
                fontSize: "11px",
                opacity: 0.5,
              }}
            >
              ● Conversation partner
            </div>

          </div>

          <button
            className="secondary-button"
            onClick={() =>
              setShowTranslation(
                (previous) =>
                  !previous
              )
            }
          >
            {showTranslation
              ? "Hide English"
              : "Show English"}
          </button>

        </div>


        {/* MESSAGES */}

        <div
          style={{
            minHeight: "430px",
            maxHeight: "520px",
            overflowY: "auto",
            padding: "20px",
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
                  padding: "13px 15px",
                  borderRadius:
                    message.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    message.role === "user"
                      ? "rgba(124,92,255,.18)"
                      : "rgba(255,255,255,.05)",
                  border:
                    "1px solid rgba(255,255,255,.07)",
                }}
              >

                <div
                  style={{
                    fontSize: "18px",
                    lineHeight: 1.6,
                  }}
                >
                  {message.japanese}
                </div>

                {message.role === "ai" &&
                  showTranslation && (

                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "12px",
                        opacity: 0.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {message.english}
                    </div>

                  )}

                {message.role === "ai" && (

                  <button
                    className="secondary-button"
                    style={{
                      marginTop: "10px",
                    }}
                    onClick={() =>
                      speakJapanese(
                        message.japanese
                      )
                    }
                  >
                    🔊 Listen
                  </button>

                )}

              </div>

            </div>

          ))}

          {isThinking && (

            <div
              style={{
                padding: "12px 15px",
                borderRadius: "14px",
                background:
                  "rgba(255,255,255,.05)",
                width: "fit-content",
                opacity: 0.6,
              }}
            >
              Novara is thinking...
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
                style={{
                  whiteSpace:
                    "nowrap",
                  fontSize: "12px",
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
            display: "flex",
            gap: "9px",
          }}
        >

          <textarea
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder="Type your Japanese response..."
            rows="1"
            style={{
              flex: 1,
              resize: "none",
              padding: "13px",
              borderRadius: "12px",
              border:
                "1px solid rgba(255,255,255,.1)",
              background:
                "rgba(255,255,255,.04)",
              color: "inherit",
              outline: "none",
              fontFamily: "inherit",
            }}
          />

          <button
            className="primary-button"
            disabled={
              !input.trim() ||
              isThinking
            }
            onClick={() =>
              sendMessage()
            }
          >
            Send →
          </button>

        </div>

      </div>


      {/* SESSION INFO */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: "12px",
          marginTop: "18px",
        }}
      >

        <div className="result-card">
          <strong>
            {sessionXP}
          </strong>
          <span>Session XP</span>
        </div>

        <div className="result-card">
          <strong>
            {messages.filter(
              (item) =>
                item.role === "user"
            ).length}
          </strong>
          <span>Responses</span>
        </div>

        <div className="result-card">
          <strong>
            {state?.streak || 7}
          </strong>
          <span>Day Streak</span>
        </div>

      </div>


      <div
        className="path-tip"
        style={{
          marginTop: "18px",
        }}
      >

        <span>💡</span>

        <div>

          <strong>
            Conversation tip
          </strong>

          <p>
            Try answering in Japanese even if
            you make mistakes. Practice matters
            more than perfection.
          </p>

        </div>

      </div>

    </section>
  );
}

function MiniFeature({
  icon,
  title,
  text,
}) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "12px",
        background:
          "rgba(255,255,255,.035)",
      }}
    >

      <div
        style={{
          fontSize: "20px",
          marginBottom: "7px",
        }}
      >
        {icon}
      </div>

      <strong>
        {title}
      </strong>

      <div
        style={{
          fontSize: "11px",
          opacity: 0.45,
          marginTop: "3px",
        }}
      >
        {text}
      </div>

    </div>
  );
}