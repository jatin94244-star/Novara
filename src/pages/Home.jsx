import React from "react";
import { ArrowRight, Brain, Check, Flame, Headphones, Mic2, Play, Sparkles, Target } from "lucide-react";
import { lessons, missions, vocab } from "../data/content";
import StatCard from "../components/StatCard";

export default function Home({ state, setPage, completeLesson, addXP }) {
  const due = vocab.filter(v => v.due).length;
  return <div className="page">
    <section className="hero-card">
      <div><span className="eyebrow"><Sparkles size={14}/> PERSONALIZED FOR YOU</span><h1>Good evening. Ready to <em>keep going?</em></h1>
      <p>Your Japanese path is moving well. Novara found a few areas worth reinforcing today.</p>
      <button className="primary-btn" onClick={() => setPage("path")}>Continue learning <ArrowRight size={16}/></button></div>
      <div className="hero-orb"><div className="orb-ring"/><div className="orb-core">日本語</div></div>
    </section>

    <div className="stats-grid">
      <StatCard label="Current streak" value={`${state.streak} days`} meta="Best: 14 days" icon={<Flame/>}/>
      <StatCard label="Today's progress" value="68%" meta="18 min studied" icon={<Target/>}/>
      <StatCard label="Words mastered" value="247" meta={`+12 this week`} icon={<Brain/>}/>
      <StatCard label="Speaking" value="86%" meta="↑ 4% this week" icon={<Mic2/>}/>
    </div>

    <div className="content-grid">
      <section className="panel path-preview">
        <div className="panel-head"><div><span className="eyebrow">YOUR PATH</span><h2>Japanese · N5</h2></div><button className="text-btn" onClick={() => setPage("path")}>View path <ArrowRight size={15}/></button></div>
        <div className="progress-line"><span style={{width:"34%"}}/></div>
        {lessons.slice(0,4).map((l,i)=><button className="lesson-row" key={l.id} onClick={() => l.status !== "locked" && setPage("lesson")}>
          <div className={`lesson-node ${l.status}`}><span>{l.status === "complete" ? <Check size={16}/> : i+1}</span></div>
          <div className="lesson-copy"><strong>{l.title}</strong><span>{l.subtitle}</span></div><div className="lesson-meta">{l.progress ? `${l.progress}%` : "Locked"}</div>
        </button>)}
      </section>

      <section className="panel mission-panel">
        <div className="panel-head"><div><span className="eyebrow">DAILY MISSION</span><h2>Build today's momentum</h2></div><span className="mission-count">{missions.filter(m=>m.done).length}/{missions.length}</span></div>
        {missions.map(m=><div className={`mission ${m.done ? "done":""}`} key={m.id}><span className="check">{m.done ? <Check size={13}/> : ""}</span><div><strong>{m.title}</strong><small>+{m.reward} XP</small></div></div>)}
        <button className="secondary-btn full" onClick={() => addXP(50)}><Sparkles size={15}/> Claim practice bonus</button>
      </section>
    </div>

    <section className="quick-grid">
      <button onClick={() => setPage("tutor")}><BotIcon/><span><b>AI Tutor</b><small>Ask anything about Japanese</small></span><ArrowRight/></button>
      <button onClick={() => setPage("conversation")}><Mic2/><span><b>Conversation</b><small>Practice a real-world scenario</small></span><ArrowRight/></button>
      <button onClick={() => setPage("vocab")}><Headphones/><span><b>Review now</b><small>{due} words need attention</small></span><ArrowRight/></button>
    </section>
  </div>
}
function BotIcon(){ return <div className="quick-icon"><Sparkles size={19}/></div> }