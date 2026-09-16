import React, { useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Home from "./pages/Home";
import Path from "./pages/Path";
import Lesson from "./pages/Lesson";
import Tutor from "./pages/Tutor";
import Conversation from "./pages/Conversation";
import Vocabulary from "./pages/Vocabulary";
import Analytics from "./pages/Analytics";
import SimplePage from "./pages/SimplePage";
import Grammar from "./pages/Grammar";
import { useNovaraStore } from "./store/useNovaraStore";

export default function App() {
  const [page, setPage] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Currently selected lesson
  const [lessonId, setLessonId] = useState(2);

  const {
    state,
    addXP,
    completeLesson,
  } = useNovaraStore();

  const openLesson = (id) => {
    setLessonId(id);
    setPage("lesson");
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return (
          <Home
            state={state}
            setPage={setPage}
            completeLesson={completeLesson}
            addXP={addXP}
          />
        );

      case "path":
        return (
          <Path
            setPage={setPage}
            openLesson={openLesson}
            state={state}
          />
        );

      case "lesson":
        return (
          <Lesson
            setPage={setPage}
            completeLesson={completeLesson}
            lessonId={lessonId}
          />
        );

      case "tutor":
        return <Tutor state={state} />;
case "grammar":
  return <Grammar />;
      case "conversation":
        return <Conversation />;

      case "vocab":
        return <Vocabulary addXP={addXP} />;

      case "analytics":
        return <Analytics state={state} />;

      case "achievements":
        return (
          <SimplePage
            type="achievements"
            state={state}
          />
        );

      case "profile":
        return (
          <SimplePage
            type="profile"
            state={state}
          />
        );

      case "settings":
        return (
          <SimplePage
            type="settings"
            state={state}
          />
        );

      default:
        return (
          <Home
            state={state}
            setPage={setPage}
            completeLesson={completeLesson}
            addXP={addXP}
          />
        );
    }
  };

  return (
    <div className="app">

      <Sidebar
        page={page}
        setPage={setPage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="main">

        <Topbar
          setMobileOpen={setMobileOpen}
          state={state}
        />

        {renderPage()}

      </main>

    </div>
  );
}