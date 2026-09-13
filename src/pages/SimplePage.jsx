import React from "react";
import { Award, Settings, UserRound } from "lucide-react";
export default function SimplePage({type,state}){
 const data={achievements:["ACHIEVEMENTS","Build milestones that reflect real learning.","First Conversation","7-Day Streak","100 Words","Perfect Lesson"],profile:["PROFILE","Your learning identity across Novara.","Japanese — N5","English — B2","Korean — A1"],settings:["SETTINGS","Control your learning experience.","Appearance","Learning preferences","Notifications","Accessibility"]}[type];
 const Icon=type==="profile"?UserRound:type==="settings"?Settings:Award;
 return <div className="page"><div className="page-title"><div><span className="eyebrow">{data[0]}</span><h1>{data[1]}</h1></div></div><div className="simple-grid">{data.slice(2).map((x,i)=><div className="simple-card" key={x}><div className="stat-icon"><Icon size={18}/></div><div><b>{x}</b><span>{type==="achievements"?`Milestone ${i+1}`:"Configured in your Novara profile"}</span></div>{type==="achievements"&&<strong>{i<2?"Unlocked":"Progress"}</strong>}</div>)}</div></div>
}