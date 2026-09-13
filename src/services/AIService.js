import { mockAI } from "./mockAI";

export const AIService = {
  mode: "mock",
  tutor: (message, context) => mockAI.tutor(message, context),
  checkAnswer: (answer, expected) => mockAI.checkAnswer(answer, expected),
  generateExercise: (skill) => mockAI.generateExercise(skill),
  generateLesson: async () => ({ title: "AI Generated Practice", status: "mock" }),
  analyzeWriting: async (text) => ({
    status: "mock",
    grammar: 84,
    vocabulary: 78,
    naturalness: 81,
    corrected: text || "Write something to analyze."
  }),
  evaluateConversation: async () => ({
    grammar: 86, vocabulary: 79, naturalness: 83, accuracy: 88
  })
};