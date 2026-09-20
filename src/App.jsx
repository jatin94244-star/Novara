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
import Profile from "./pages/profile";

import { useNovaraStore } from "./store/useNovaraStore";

export default function App() {
  const [page, setPage] =
    useState("home");

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [lessonId, setLessonId] =
    useState(2);

  const {
    state,
    addXP,
    completeLesson,
    updateProfile,
    setLanguages,
    addLanguage,
    removeLanguage,
    setActiveLanguage,
  } = useNovaraStore();

  function openLesson(id) {
    setLessonId(id);
    setPage("lesson");
  }

  function renderPage() {
    switch (page) {
      case "home":
        return (
          <Home
            state={state}
            setPage={setPage}
            completeLesson={
              completeLesson
            }
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
            completeLesson={
              completeLesson
            }
            lessonId={lessonId}
          />
        );

      case "tutor":
        return (
          <Tutor state={state} />
        );

      case "conversation":
        return (
          <Conversation
            state={state}
          />
        );

      case "vocab":
        return (
          <Vocabulary
            addXP={addXP}
          />
        );

      case "analytics":
        return (
          <Analytics
            state={state}
          />
        );

      case "grammar":
        return <Grammar />;

      case "achievements":
        return (
          <SimplePage
            type="achievements"
            state={state}
          />
        );

      case "profile":
        return (
          <Profile
            state={state}
            updateProfile={
              updateProfile
            }
            setLanguages={
              setLanguages
            }
            addLanguage={
              addLanguage
            }
            removeLanguage={
              removeLanguage
            }
            setActiveLanguage={
              setActiveLanguage
            }
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
            completeLesson={
              completeLesson
            }
            addXP={addXP}
          />
        );
    }
  }

  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={setPage}
        mobileOpen={mobileOpen}
        setMobileOpen={
          setMobileOpen
        }
      />

      <main className="main">
        <Topbar
          setMobileOpen={
            setMobileOpen
          }
          state={state}
        />

        {renderPage()}
      </main>
    </div>
  );
}