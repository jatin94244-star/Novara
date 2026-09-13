export const languages = [
  { id: "ja", name: "Japanese", native: "日本語", level: "N5", progress: 34 },
  { id: "en", name: "English", native: "English", level: "B2", progress: 61 },
  { id: "ko", name: "Korean", native: "한국어", level: "A1", progress: 18 },
  { id: "es", name: "Spanish", native: "Español", level: "A1", progress: 12 },
  { id: "fr", name: "French", native: "Français", level: "A1", progress: 8 },
  { id: "de", name: "German", native: "Deutsch", level: "A1", progress: 6 },
  { id: "zh", name: "Mandarin", native: "中文", level: "A0", progress: 2 },
  { id: "it", name: "Italian", native: "Italiano", level: "A0", progress: 1 }
];

export const lessons = [
  { id: 1, title: "Greetings", subtitle: "Build your first Japanese phrases", type: "lesson", progress: 100, xp: 80, status: "complete", tag: "Foundation" },
  { id: 2, title: "Introduce Yourself", subtitle: "Names, origins and simple introductions", type: "lesson", progress: 72, xp: 100, status: "active", tag: "Current" },
  { id: 3, title: "Everyday Life", subtitle: "Talk about your daily routine", type: "lesson", progress: 0, xp: 120, status: "locked", tag: "Next" },
  { id: 4, title: "Food & Cafés", subtitle: "Order naturally and ask questions", type: "lesson", progress: 0, xp: 120, status: "locked", tag: "Next" },
  { id: 5, title: "Travel", subtitle: "Navigate real-world situations", type: "lesson", progress: 0, xp: 150, status: "locked", tag: "Next" },
  { id: 6, title: "Grammar Foundations", subtitle: "Particles, structure and patterns", type: "grammar", progress: 0, xp: 160, status: "locked", tag: "Grammar" }
];

export const vocab = [
  { id: 1, word: "こんにちは", reading: "konnichiwa", meaning: "hello", mastery: 92, due: false },
  { id: 2, word: "ありがとう", reading: "arigatou", meaning: "thank you", mastery: 84, due: true },
  { id: 3, word: "学生", reading: "gakusei", meaning: "student", mastery: 56, due: true },
  { id: 4, word: "学校", reading: "gakkou", meaning: "school", mastery: 42, due: true },
  { id: 5, word: "友達", reading: "tomodachi", meaning: "friend", mastery: 67, due: false },
  { id: 6, word: "食べる", reading: "taberu", meaning: "to eat", mastery: 31, due: true }
];

export const missions = [
  { id: 1, title: "Learn 10 words", reward: 60, done: true },
  { id: 2, title: "Complete a grammar challenge", reward: 80, done: false },
  { id: 3, title: "Speak for 3 minutes", reward: 100, done: false },
  { id: 4, title: "Finish one conversation", reward: 120, done: false },
  { id: 5, title: "Review forgotten vocabulary", reward: 70, done: false }
];