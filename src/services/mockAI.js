const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const mockAI = {
  async tutor(message, context = {}) {
    await delay(500);
    const lower = message.toLowerCase();
    if (lower.includes("particle")) {
      return "In Japanese, particles show the role a word plays in a sentence. For example, は marks the topic and を marks the object. Try: 私は学生です。";
    }
    if (lower.includes("hello")) {
      return "A natural beginner greeting is こんにちは (konnichiwa). For a casual setting, やあ can also work.";
    }
    return `Good question. Based on your ${context.level || "beginner"} level, I would explain it simply first, then give you a short practice task.`;
  },

  async checkAnswer(answer, expected) {
    await delay(350);
    const normalized = answer.trim().toLowerCase();
    const target = expected.trim().toLowerCase();
    const correct = normalized === target || normalized.includes(target);
    return {
      correct,
      score: correct ? 100 : Math.max(20, 100 - Math.abs(normalized.length - target.length) * 8),
      feedback: correct ? "Excellent — your answer matches the target." : `Not quite. A strong answer is "${expected}".`
    };
  },

  async generateExercise(skill = "grammar") {
    await delay(300);
    return skill === "grammar"
      ? { question: "Choose the correct particle: 私___学生です。", options: ["は", "を", "に", "で"], answer: "は", explanation: "は marks the topic." }
      : { question: "What does ありがとう mean?", options: ["Hello", "Thank you", "School", "Friend"], answer: "Thank you", explanation: "ありがとう means thank you." };
  }
};