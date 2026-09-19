import React, { useEffect, useRef, useState } from "react";

const scenarios = [
  {
    id: "cafe",
    title: "Café",
    icon: "☕",
    description: "Order food and drinks in Japanese.",
    starter: "こんにちは。何を注文しますか？",
    english: "Hello. What would you like to order?",
  },
  {
    id: "meeting",
    title: "Meeting Someone",
    icon: "🤝",
    description: "Introduce yourself and meet someone.",
    starter: "こんにちは。お名前は何ですか？",
    english: "Hello. What is your name?",
  },
  {
    id: "shopping",
    title: "Shopping",
    icon: "🛍️",
    description: "Practice shopping conversations.",
    starter: "いらっしゃいませ。何をお探しですか？",
    english: "Welcome. What are you looking for?",
  },
  {
    id: "travel",
    title: "Travel",
    icon: "✈️",
    description: "Practice useful travel Japanese.",
    starter: "こんにちは。どこへ行きたいですか？",
    english: "Hello. Where would you like to go?",
  },
];

function createStarter(scenario) {
  return {
    role: "assistant",
    content: scenario.starter,
    english: scenario.english,
    correction: null,
    tip: null,
    score: null,
    followUp: null,
  };
}

export default function Conversation() {
  const [selectedScenario, setSelectedScenario] = useState(
    scenarios[0]
  );

  const [messages, setMessages] = useState([
    createStarter(scenarios[0]),
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEnglish, setShowEnglish] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  const chatRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!chatRef.current) return;

    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  function changeScenario(scenario) {
    if (loading) return;

    setSelectedScenario(scenario);
    setMessages([createStarter(scenario)]);
    setInput("");
    setError("");
    setShowEnglish({});
    setCopiedIndex(null);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }

  function clearConversation() {
    if (loading) return;

    setMessages([createStarter(selectedScenario)]);
    setInput("");
    setError("");
    setShowEnglish({});
    setCopiedIndex(null);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) return;

    setError("");

    const userMessage = {
      role: "user",
      content: text,
    };

    const historyForApi = messages
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
  "https://novara-ruby.vercel.app/api/chat",
  {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          mode: "conversation",
          scenario: selectedScenario.title,
          messages: historyForApi,
        }),
      });

      const raw = await response.text();

      let data;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          raw || "The server returned an invalid response."
        );
      }

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.error || "Novara AI request failed."
        );
      }

      const reply =
        data.reply ||
        data.japanese ||
        "";

      if (!reply.trim()) {
        throw new Error(
          "Novara AI returned an empty response."
        );
      }

      const assistantMessage = {
        role: "assistant",
        content: reply,
        english: data.english || "",
        correction: data.correction || null,
        tip: data.tip || null,
        score:
          typeof data.score === "number"
            ? data.score
            : null,
        followUp: data.followUp || null,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (err) {
      console.error(
        "Novara Conversation Error:",
        err
      );

      setError(
        err.message ||
          "Sorry, I couldn't connect to Novara AI."
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

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
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  async function copyText(text, index) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1200);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  }

  function toggleEnglish(index) {
    setShowEnglish((current) => ({
      ...current,
      [index]: !current[index],
    }));
  }

  return (
    <section className="page novara-conversation-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header novara-conversation-header">

        <div>
          <div className="eyebrow">
            NOVARA AI CONVERSATION
          </div>

          <h1>
            Conversation
          </h1>

          <p>
            Practice real Japanese conversations
            with Novara AI.
          </p>
        </div>

        <div className="language-pill">
          🇯🇵 Japanese
        </div>

      </div>


      {/* =====================================================
          SCENARIOS
      ===================================================== */}

      <div className="novara-scenario-wrapper">

        <div className="novara-scenario-scroll">

          {scenarios.map((scenario) => {
            const active =
              selectedScenario.id === scenario.id;

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() =>
                  changeScenario(scenario)
                }
                disabled={loading}
                className={
                  active
                    ? "novara-scenario-card active"
                    : "novara-scenario-card"
                }
              >
                <span className="novara-scenario-icon">
                  {scenario.icon}
                </span>

                <span className="novara-scenario-text">
                  <strong>
                    {scenario.title}
                  </strong>

                  <small>
                    {scenario.description}
                  </small>
                </span>

              </button>
            );
          })}

        </div>

      </div>


      {/* =====================================================
          CURRENT SCENARIO
      ===================================================== */}

      <div className="novara-current-scenario">

        <div>
          <span className="novara-current-icon">
            {selectedScenario.icon}
          </span>

          <div>
            <div className="eyebrow">
              CURRENT SCENARIO
            </div>

            <h2>
              {selectedScenario.title}
            </h2>
          </div>
        </div>

        <button
          type="button"
          className="novara-clear-button"
          onClick={clearConversation}
          disabled={loading}
        >
          ↻ New Chat
        </button>

      </div>


      {/* =====================================================
          CHAT
      ===================================================== */}

      <div className="novara-chat-card">

        <div
          ref={chatRef}
          className="novara-chat-messages"
        >

          {messages.map((message, index) => {
            const isUser =
              message.role === "user";

            return (
              <div
                key={`${index}-${message.content}`}
                className={
                  isUser
                    ? "novara-message-row user"
                    : "novara-message-row assistant"
                }
              >

                <div
                  className={
                    isUser
                      ? "novara-message user"
                      : "novara-message assistant"
                  }
                >

                  {!isUser && (
                    <div className="novara-message-label">
                      <span>✦</span>
                      NOVARA
                    </div>
                  )}

                  {isUser && (
                    <div className="novara-message-label user-label">
                      YOU
                    </div>
                  )}

                  <div className="novara-japanese-text">
                    {message.content}
                  </div>


                  {/* Assistant tools */}

                  {!isUser && (
                    <div className="novara-message-actions">

                      <button
                        type="button"
                        onClick={() =>
                          speak(message.content)
                        }
                        className="novara-mini-button"
                      >
                        🔊 Listen
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            message.content,
                            index
                          )
                        }
                        className="novara-mini-button"
                      >
                        {copiedIndex === index
                          ? "✓ Copied"
                          : "Copy"}
                      </button>

                      {message.english && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleEnglish(index)
                          }
                          className="novara-mini-button"
                        >
                          🇬🇧{" "}
                          {showEnglish[index]
                            ? "Hide"
                            : "English"}
                        </button>
                      )}

                    </div>
                  )}


                  {/* English */}

                  {!isUser &&
                    message.english &&
                    showEnglish[index] && (
                      <div className="novara-english-box">
                        <span>🇬🇧</span>

                        <div>
                          <strong>
                            English
                          </strong>

                          <p>
                            {message.english}
                          </p>
                        </div>
                      </div>
                    )}


                  {/* Correction */}

                  {!isUser &&
                    message.correction && (
                      <div className="novara-correction-box">
                        <span>✏️</span>

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


                  {/* Tip */}

                  {!isUser &&
                    message.tip && (
                      <div className="novara-tip-box">
                        <span>💡</span>

                        <div>
                          <strong>
                            Novara Tip
                          </strong>

                          <p>
                            {message.tip}
                          </p>
                        </div>
                      </div>
                    )}


                  {/* Score */}

                  {!isUser &&
                    typeof message.score ===
                      "number" && (
                      <div className="novara-score">
                        <span>
                          Japanese Score
                        </span>

                        <strong>
                          {message.score}/100
                        </strong>
                      </div>
                    )}

                </div>

              </div>
            );
          })}


          {/* =================================================
              TYPING INDICATOR
          ================================================= */}

          {loading && (
            <div className="novara-message-row assistant">

              <div className="novara-message assistant typing">

                <div className="novara-message-label">
                  <span>✦</span>
                  NOVARA
                </div>

                <div className="novara-typing">
                  <span />
                  <span />
                  <span />
                  <em>
                    Thinking...
                  </em>
                </div>

              </div>

            </div>
          )}

        </div>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="novara-error">

            <span>⚠️</span>

            <div>
              <strong>
                AI Connection Error
              </strong>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                Dismiss
              </button>
            </div>

          </div>
        )}


        {/* ===================================================
            INPUT
        =================================================== */}

        <div className="novara-input-area">

          <div className="novara-input-wrapper">

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Type in Japanese, English or Hinglish..."
              rows={1}
              disabled={loading}
              className="novara-chat-input"
            />

            <div className="novara-input-hint">
              Enter to send · Shift + Enter for new line
            </div>

          </div>

          <button
            type="button"
            className="novara-send-button"
            onClick={sendMessage}
            disabled={
              !input.trim() ||
              loading
            }
            aria-label="Send message"
          >
            {loading ? (
              <span className="novara-send-loading">
                •••
              </span>
            ) : (
              <>
                <span>Send</span>
                <span>↑</span>
              </>
            )}
          </button>

        </div>

      </div>

    </section>
  );
}