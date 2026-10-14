import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, CalendarDays, Check, ChevronDown, ChevronRight,
  Clock3, Dumbbell, Flame, History, House, Menu, Plus, RotateCcw, Settings2, Target,
  TrendingUp, Trophy, UserRound, Weight, X, Play, Pause, Save
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { EXERCISES, EXERCISE_BY_ID } from "./data/exercises";
import { generateWorkoutPlan } from "./utils/workoutGenerator";
import { feetInchesToCm, cmToFeetInches, formatHeight } from "./utils/heightConverter";
import { getProgression } from "./utils/progressiveOverload";
import { getExerciseHistory, getPersonalRecords, workoutVolume } from "./utils/progressCalculator";
import { clearAppData, loadAppData, saveAppData } from "./utils/storage";

const blankData = { profile: null, plan: [], workouts: [], bodyWeights: [] };
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: House },
  { id: "workout", label: "My Workout", icon: Dumbbell },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "history", label: "History", icon: History },
  { id: "profile", label: "Profile", icon: UserRound }
];
const todayKey = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}
function SectionTitle({ eyebrow, title, action }) {
  return <div className="section-title"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div>{action}</div>;
}
function Button({ children, onClick, variant = "primary", className = "", type = "button", disabled = false }) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`btn btn-${variant} ${className}`}>{children}</button>;
}
function StatCard({ label, value, detail, icon: Icon, accent = false }) {
  return <Card className={`stat-card ${accent ? "stat-accent" : ""}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={18}/></span></div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></Card>;
}

function Onboarding({ onComplete }) {
  const [unit, setUnit] = useState("imperial");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("8");
  const [cm, setCm] = useState("173");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("Muscle Gain");
  const [experience, setExperience] = useState("Beginner");
  const [days, setDays] = useState(4);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const heightCm = unit === "imperial" ? feetInchesToCm(feet, inches) : Number(cm);
  const converted = cmToFeetInches(heightCm);
  function submit(event) {
    event.preventDefault();
    if (!Number.isFinite(heightCm) || heightCm < 80 || heightCm > 250) {
      setError("Enter a valid height between 80 and 250 cm."); return;
    }
    if (weight && (Number(weight) < 20 || Number(weight) > 400)) {
      setError("Enter a valid body weight between 20 and 400 kg."); return;
    }
    const profile = { name: name.trim(), heightCm: Math.round(heightCm * 10) / 10, weight: weight ? Number(weight) : "", goal, experience, days: Number(days), unit: "kg" };
    onComplete(profile);
  }

  return <div className="onboarding-shell">
    <div className="onboarding-art">
      <div className="brand"><span className="brand-mark"><Dumbbell size={21}/></span> FORGE</div>
      <div className="onboarding-message"><span className="pill"><span className="dot"/> YOUR TRAINING, REFINED</span><h1>Build strength.<br/><em>Track every rep.</em></h1><p>A training plan that adapts to your schedule and helps you make progress one workout at a time.</p></div>
      <div className="art-bottom"><div className="art-metric"><strong>01</strong><span>Set a goal</span></div><div className="art-line"/><div className="art-metric"><strong>02</strong><span>Train consistently</span></div><div className="art-line"/><div className="art-metric"><strong>03</strong><span>Progress over time</span></div></div>
      <div className="orb orb-one"/><div className="orb orb-two"/>
    </div>
    <div className="onboarding-form-wrap"><form className="onboarding-form" onSubmit={submit}>
      <div className="mobile-brand brand"><span className="brand-mark"><Dumbbell size={21}/></span> FORGE</div>
      <div className="eyebrow">LET'S GET STARTED</div><h2>Your plan starts here.</h2><p className="muted">A few details help us build your weekly split.</p>
      <label className="field-label">What should we call you? <span className="optional">Optional</span></label><input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
      <div className="field-heading"><label className="field-label">Your height</label><div className="segmented"><button type="button" className={unit==="imperial"?"selected":""} onClick={()=>{if(unit!=="imperial"){const v=cmToFeetInches(cm);setFeet(String(v.feet));setInches(String(v.inches));}setUnit("imperial");}}>ft / in</button><button type="button" className={unit==="metric"?"selected":""} onClick={()=>{if(unit!=="metric")setCm(String(Math.round(feetInchesToCm(feet,inches))));setUnit("metric");}}>cm</button></div></div>
      {unit==="imperial" ? <div className="input-row"><div><label className="small-label">Feet</label><input className="input" type="number" min="2" max="8" value={feet} onChange={e=>setFeet(e.target.value)}/></div><div><label className="small-label">Inches</label><input className="input" type="number" min="0" max="11" value={inches} onChange={e=>setInches(e.target.value)}/></div></div> : <div><input className="input" type="number" min="80" max="250" value={cm} onChange={e=>setCm(e.target.value)} placeholder="Height in cm"/></div>}
      <div className="conversion-note"><Check size={14}/> {unit==="imperial" ? `That's approximately ${Math.round(heightCm)} cm` : `That's ${converted.feet} ft ${converted.inches} in`}</div>
      <label className="field-label field-spaced">Current body weight <span className="optional">Optional · kg</span></label><input className="input" type="number" min="20" max="400" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="e.g. 72.5"/>
      <label className="field-label field-spaced">What's your main goal?</label><div className="choice-grid">{["Muscle Gain","Strength","Fat Loss","General Fitness"].map((item,i)=><button type="button" key={item} className={`choice ${goal===item?"choice-selected":""}`} onClick={()=>setGoal(item)}><span className="choice-symbol">{["↗","✦","◒","◎"][i]}</span>{item}</button>)}</div>
      <label className="field-label field-spaced">Training experience</label><div className="experience-row">{["Beginner","Intermediate","Advanced"].map(x=><button type="button" key={x} onClick={()=>setExperience(x)} className={`experience-option ${experience===x?"selected":""}`}>{x}</button>)}</div>
      <label className="field-label field-spaced">How many days can you train?</label><div className="days-grid">{[2,3,4,5,6].map(n=><button type="button" key={n} className={`day-choice ${days===n?"selected":""}`} onClick={()=>setDays(n)}><strong>{n}</strong><span>days</span></button>)}</div>
      {error && <div className="error-note">{error}</div>}
      <Button type="submit" className="full-width">Build my workout plan <ChevronRight size={17}/></Button><p className="privacy-note">Your data stays in this browser. No account required.</p>
    </form></div>
  </div>;
}

function App() {
  const [data, setData] = useState(() => loadAppData() || blankData);
  const [page, setPage] = useState(data.profile ? "dashboard" : "onboarding");
  const [mobileNav, setMobileNav] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [session, setSession] = useState(null);
  const [restSeconds, setRestSeconds] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("30");
  const [selectedExercise, setSelectedExercise] = useState("bench");
  const [weightEntry, setWeightEntry] = useState("");
  const [profileDraft, setProfileDraft] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => saveAppData(data), [data]);
  useEffect(() => {
    if (!restRunning || restSeconds <= 0) return;
    const timer = setTimeout(() => setRestSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [restRunning, restSeconds]);
  useEffect(() => {
    if (restRunning && restSeconds === 0) setRestRunning(false);
  }, [restRunning, restSeconds]);

  const workouts = data.workouts || [];
  const completed = workouts.filter(w => w.completed);
  const totalVolume = completed.reduce((sum,w)=>sum+workoutVolume(w),0);
  const prs = useMemo(() => getPersonalRecords(workouts), [workouts]);
  const profile = data.profile;
  const plan = data.plan || [];
  const activePlanDay = plan[activeDay] || plan[0];
  const latestWeight = [...(data.bodyWeights || [])].sort((a,b)=>b.date.localeCompare(a.date))[0]?.weight ?? profile?.weight ?? "";
  const exerciseHistory = useMemo(() => getExerciseHistory(workouts, selectedExercise), [workouts, selectedExercise]);
  const filteredExerciseHistory = useMemo(() => {
    if (historyFilter === "all") return exerciseHistory;
    const days = Number(historyFilter);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
    return exerciseHistory.filter(item => {
      const parsed = new Date(item.date + ` ${new Date().getFullYear()}`);
      return true;
    }).slice(-Math.max(1, days === 7 ? 7 : days === 30 ? 30 : 90));
  }, [exerciseHistory, historyFilter]);

  function updateData(patch) { setData(prev => ({ ...prev, ...patch })); }
  function completeOnboarding(newProfile) {
    const newPlan = generateWorkoutPlan(newProfile.days, newProfile.experience, newProfile.goal);
    updateData({ profile: newProfile, plan: newPlan, workouts: data.workouts || [], bodyWeights: newProfile.weight ? [...(data.bodyWeights||[]), {date: todayKey(), weight:Number(newProfile.weight)}] : (data.bodyWeights||[]) });
    setPage("dashboard");
  }
  function startWorkout(day = activePlanDay) {
    if (!day) return;
    const previous = [...workouts].filter(w=>w.completed).reverse();
    const exercises = day.exercises.map(item => {
      const exercise = EXERCISE_BY_ID[item.exerciseId];
      const priorExercise = previous.map(w => (w.exercises||[]).find(e=>e.exerciseId===item.exerciseId)).find(Boolean);
      const priorSet = priorExercise?.sets?.find(s=>s.completed);
      return {
        exerciseId: item.exerciseId,
        sets: Array.from({length:item.sets},(_,i)=>({
          id: uid(), weight: item.weight !== "" ? item.weight : (priorSet?.weight ?? ""),
          reps: Number((String(exercise?.reps || "8–12").match(/(\d+)/)||[])[1] || 10),
          completed: false
        }))
      };
    });
    setSession({ id: uid(), planDayId: day.id, name: day.name, focus: day.focus, date: new Date().toISOString(), startedAt: Date.now(), exercises });
    setPage("workout");
  }
  function updateSessionSet(exerciseIndex, setIndex, key, value) {
    setSession(prev => ({...prev, exercises: prev.exercises.map((exercise,ei)=>ei!==exerciseIndex?exercise:{...exercise,sets:exercise.sets.map((set,si)=>si!==setIndex?set:{...set,[key]:key==="completed"?value:value})})}));
  }
  function addSet(exerciseIndex) {
    setSession(prev=>({...prev,exercises:prev.exercises.map((e,i)=>i!==exerciseIndex?e:{...e,sets:[...e.sets,{id:uid(),weight:e.sets.at(-1)?.weight||"",reps:e.sets.at(-1)?.reps||10,completed:false}]})}));
  }
  function removeSet(exerciseIndex,setIndex) {
    setSession(prev=>({...prev,exercises:prev.exercises.map((e,i)=>i!==exerciseIndex?e:{...e,sets:e.sets.filter((_,si)=>si!==setIndex)})}));
  }
  function finishWorkout() {
    if (!session) return;
    const record = {...session, completed:true, endedAt:new Date().toISOString(), durationSeconds:Math.max(0,Math.round((Date.now()-session.startedAt)/1000))};
    updateData({workouts:[...workouts,record]});
    setSession(null); setPage("dashboard"); setNotice("Workout saved. Nice work showing up."); setTimeout(()=>setNotice(""),3500);
  }
  function cancelSession() {
    if (!session) return;
    if (confirm("Discard this workout session? It will not be added to history.")) { setSession(null); setPage("dashboard"); }
  }
  function changeProfile(field,value) { setProfileDraft(prev=>({...prev,[field]:value})); }
  function saveProfile() {
    if (!profileDraft) return;
    const updated = {...profile,...profileDraft, days:Number(profileDraft.days)};
    const changedPlan = updated.days !== profile.days || updated.goal !== profile.goal || updated.experience !== profile.experience;
    updateData({profile:updated, ...(changedPlan ? {plan:generateWorkoutPlan(updated.days,updated.experience,updated.goal)} : {})});
    setProfileDraft(null); setNotice("Profile saved."); setTimeout(()=>setNotice(""),2500);
  }
  function addBodyWeight(event) {
    event.preventDefault();
    const n=Number(weightEntry);
    if (!Number.isFinite(n)||n<20||n>400) return;
    updateData({bodyWeights:[...(data.bodyWeights||[]),{date:todayKey(),weight:n}]});
    setWeightEntry("");
  }
  function resetAll() {
    if (!confirm("Reset all Forge data in this browser? This cannot be undone.")) return;
    clearAppData(); setData(blankData); setSession(null); setPage("onboarding");
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="forge-workout-data.json"; a.click(); URL.revokeObjectURL(url);
  }
  if (!profile || page === "onboarding") return <Onboarding onComplete={completeOnboarding}/>;

  const nav = <>{navItems.map(({id,label,icon:Icon})=><button key={id} onClick={()=>{setPage(id);setMobileNav(false);}} className={`nav-link ${page===id?"nav-active":""}`}><Icon size={18}/><span>{label}</span>{page===id&&<span className="nav-active-bar"/>}</button>)}</>;
  const todayWorkout = plan[Math.floor((new Date().getDay()+6)%7 % Math.max(1,plan.length))] || plan[0];
  const greeting = new Date().getHours()<12?"Good morning":new Date().getHours()<18?"Good afternoon":"Good evening";
  const pageTitle = ({dashboard:"Dashboard",workout:"My Workout",progress:"Progress",history:"Workout History",profile:"Your Profile"})[page] || "Dashboard";

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"sidebar-open":""}`}>
      <div className="brand"><span className="brand-mark"><Dumbbell size={20}/></span> FORGE<span className="brand-period">.</span></div>
      <div className="workspace-label">WORKSPACE</div><nav>{nav}</nav>
      <div className="sidebar-bottom"><div className="coach-card"><div className="coach-icon"><Target size={18}/></div><div><strong>Small wins add up.</strong><p>Consistency beats perfection.</p></div></div><div className="profile-mini"><div className="avatar">{(profile.name||"A").slice(0,1).toUpperCase()}</div><div className="profile-mini-text"><strong>{profile.name||"Athlete"}</strong><span>{profile.goal}</span></div><button title="Open profile" onClick={()=>setPage("profile")}><Settings2 size={17}/></button></div></div>
    </aside>
    {mobileNav&&<button className="mobile-overlay" onClick={()=>setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu size={20}/></button><span className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{pageTitle}</strong></span></div><div className="topbar-right"><span className="today-label"><CalendarDays size={15}/>{new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</span><button className="top-avatar" onClick={()=>setPage("profile")}>{(profile.name||"A").slice(0,1).toUpperCase()}</button></div></header>
      <div className="page-content">
        {notice&&<div className="notice"><Check size={16}/>{notice}<button onClick={()=>setNotice("")}><X size={14}/></button></div>}
        {page==="dashboard"&&<Dashboard profile={profile} plan={plan} completed={completed} workouts={workouts} totalVolume={totalVolume} prs={prs} latestWeight={latestWeight} todayWorkout={todayWorkout} startWorkout={startWorkout} setPage={setPage}/>}
        {page==="workout"&&<WorkoutPage plan={plan} activeDay={activeDay} setActiveDay={setActiveDay} startWorkout={startWorkout} session={session} updateSessionSet={updateSessionSet} addSet={addSet} removeSet={removeSet} finishWorkout={finishWorkout} cancelSession={cancelSession} replaceSessionExercise={(exerciseIndex,newId)=>setSession(prev=>({...prev,exercises:prev.exercises.map((e,i)=>i!==exerciseIndex?e:{exerciseId:newId,sets:Array.from({length:EXERCISE_BY_ID[newId].sets||3},(_,k)=>({id:uid(),weight:"",reps:Number((EXERCISE_BY_ID[newId].reps.match(/\d+/)||[])[0]||10),completed:false}))})}))} restSeconds={restSeconds} setRestSeconds={setRestSeconds} restRunning={restRunning} setRestRunning={setRestRunning} history={workouts}/>}
        {page==="progress"&&<ProgressPage workouts={workouts} completed={completed} totalVolume={totalVolume} prs={prs} exerciseHistory={filteredExerciseHistory} selectedExercise={selectedExercise} setSelectedExercise={setSelectedExercise} historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} bodyWeights={data.bodyWeights||[]} latestWeight={latestWeight} weightEntry={weightEntry} setWeightEntry={setWeightEntry} addBodyWeight={addBodyWeight}/>}
        {page==="history"&&<HistoryPage workouts={workouts} setPage={setPage} startWorkout={startWorkout}/>}
        {page==="profile"&&<ProfilePage profile={profile} draft={profileDraft||profile} changeProfile={changeProfile} saveProfile={saveProfile} resetAll={resetAll} exportData={exportData} plan={plan} heightText={formatHeight(profile.heightCm)}/>}
      </div>
      <footer className="app-footer"><span>FORGE <span className="brand-period">.</span> TRAIN WITH INTENT.</span><span>Made for consistency, not perfection.</span></footer>
    </main>
  </div>;
}

function Dashboard({profile,plan,completed,workouts,totalVolume,prs,latestWeight,todayWorkout,startWorkout,setPage}) {
  const last7 = completed.filter(w=>Date.now()-new Date(w.date).getTime()<=7*86400000).length;
  const goalDays = Number(profile.days)||4;
  const nextDay = plan.find(day=>!completed.some(w=>w.planDayId===day.id&&new Date(w.date).toDateString()===new Date().toDateString())) || todayWorkout;
  const recent = [...completed].reverse().slice(0,4);
  return <div className="page-stack">
    <div className="welcome-row"><div><div className="eyebrow">{new Date().toLocaleDateString(undefined,{month:"long",year:"numeric"}).toUpperCase()} · YOUR TRAINING SPACE</div><h1>{profile.name?`${"Hey, "+profile.name}.`:"Welcome back."} <span className="wave">✳</span></h1><p className="muted">Every rep is a step forward. Let's make today count.</p></div><Button onClick={()=>setPage("profile")} variant="secondary"><Settings2 size={16}/> Edit profile</Button></div>
    <div className="stats-grid">
      <StatCard label="Workouts completed" value={completed.length} detail="All-time sessions" icon={Dumbbell} accent/>
      <StatCard label="This week" value={`${last7} / ${goalDays}`} detail="Sessions in the last 7 days" icon={CalendarDays}/>
      <StatCard label="Training volume" value={totalVolume>=1000?`${(totalVolume/1000).toFixed(1)}k`:Math.round(totalVolume)} detail="kg × reps · all logged sets" icon={Activity}/>
      <StatCard label="Current weight" value={latestWeight?`${latestWeight} kg`:"—"} detail={latestWeight?"Latest entry":"Add it in Progress"} icon={Weight}/>
    </div>
    <div className="dashboard-grid">
      <Card className="today-card"><div className="card-heading"><div><div className="eyebrow">UP NEXT</div><h3>{nextDay?.name||"Your workout"}</h3></div><span className="icon-square"><Dumbbell size={20}/></span></div><p className="muted">{nextDay?.focus||"Your personalized plan is ready."}</p><div className="workout-preview-list">{(nextDay?.exercises||[]).slice(0,4).map(item=><div className="preview-exercise" key={item.exerciseId}><span className="exercise-dot"/><span>{EXERCISE_BY_ID[item.exerciseId]?.name}</span><span className="preview-sets">{item.sets} sets</span></div>)}</div><div className="today-bottom"><div className="mini-meta"><span><Clock3 size={14}/> 45–65 min</span><span><Dumbbell size={14}/> {nextDay?.exercises.length||0} exercises</span></div><Button onClick={()=>startWorkout(nextDay)}><Play size={16} fill="currentColor"/> Start workout</Button></div></Card>
      <Card className="week-card"><div className="card-heading"><div><div className="eyebrow">YOUR ROUTINE</div><h3>Weekly split</h3></div><button className="text-button" onClick={()=>setPage("workout")}>View plan <ChevronRight size={14}/></button></div><div className="week-list">{plan.map((day,index)=><div className="week-item" key={day.id}><div className="week-index">{String(index+1).padStart(2,"0")}</div><div className="week-day-name"><strong>{day.name}</strong><span>{day.exercises.length} exercises · {day.focus.split("·")[0].trim()}</span></div><span className="week-status">{index===0?"A":index===1?"B":String.fromCharCode(65+index)}</span></div>)}</div><div className="recovery-note"><span className="recovery-dot"/> Rest days are part of progress too.</div></Card>
    </div>
    <div className="lower-grid">
      <Card><div className="card-heading"><div><div className="eyebrow">RECENT ACTIVITY</div><h3>Recent workouts</h3></div><button className="text-button" onClick={()=>setPage("history")}>See history <ChevronRight size={14}/></button></div>
        {recent.length? <div className="recent-list">{recent.map(w=><div className="recent-item" key={w.id}><div className="recent-icon"><Check size={17}/></div><div className="recent-info"><strong>{w.name}</strong><span>{new Date(w.date).toLocaleDateString(undefined,{month:"short",day:"numeric"})} · {w.exercises.length} exercises</span></div><strong className="recent-volume">{Math.round(workoutVolume(w)).toLocaleString()} <small>kg·reps</small></strong></div>)}</div>:<EmptyState icon={Dumbbell} title="Your first workout is waiting" text="Complete a session and your activity will show up here."/>}
      </Card>
      <Card><div className="card-heading"><div><div className="eyebrow">PERSONAL BESTS</div><h3>Strength milestones</h3></div><Trophy size={19} className="subtle-icon"/></div>
        {prs.length?<div className="pr-list">{prs.slice(0,4).map(pr=><div className="pr-item" key={pr.exerciseId}><div className="pr-icon"><Trophy size={15}/></div><div className="pr-info"><strong>{EXERCISE_BY_ID[pr.exerciseId]?.name||pr.exerciseId}</strong><span>{pr.reps} reps · {new Date(pr.date).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</span></div><b>{pr.weight} <small>kg</small></b></div>)}</div>:<EmptyState icon={Trophy} title="No records yet" text="Log a workout to start building your personal bests."/>}
      </Card>
    </div>
  </div>;
}

function WorkoutPage({plan,activeDay,setActiveDay,startWorkout,session,updateSessionSet,addSet,removeSet,finishWorkout,cancelSession,replaceSessionExercise,restSeconds,setRestSeconds,restRunning,setRestRunning,history}) {
  const [detailExercise,setDetailExercise] = useState(null);
  const [replaceTarget,setReplaceTarget] = useState(null);
  const [replacement,setReplacement] = useState("");
  const day = plan[activeDay] || plan[0];
  const elapsed = session ? Math.max(0,Math.floor((Date.now()-session.startedAt)/1000)) : 0;
  const formatTime = n => `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`;
  function replaceExercise() {
    if (!session || !replaceTarget || !replacement) return;
    replaceSessionExercise(replaceTarget, replacement);
    setReplaceTarget(null); setReplacement("");
  }
  return <div className="page-stack">
    <SectionTitle eyebrow="YOUR TRAINING PLAN" title="My workout" action={<span className="pill muted-pill"><span className="dot"/> {plan.length} day split</span>}/>
    {!session ? <>
      <div className="day-tabs">{plan.map((d,i)=><button key={d.id} onClick={()=>setActiveDay(i)} className={`day-tab ${activeDay===i?"day-tab-active":""}`}><span>DAY {String(i+1).padStart(2,"0")}</span><strong>{d.name}</strong><small>{d.exercises.length} exercises</small></button>)}</div>
      {day&&<Card className="plan-detail-card"><div className="plan-detail-head"><div><div className="eyebrow">WORKOUT OVERVIEW</div><h3>{day.name}</h3><p className="muted">{day.focus}</p></div><Button onClick={()=>startWorkout(day)}><Play size={16} fill="currentColor"/> Start this workout</Button></div>
        <div className="exercise-table"><div className="exercise-table-head"><span>EXERCISE</span><span>SETS</span><span>REPS</span><span>REST</span><span></span></div>
          {day.exercises.map((item,i)=>{const ex=EXERCISE_BY_ID[item.exerciseId];return <div className="exercise-table-row" key={item.exerciseId}><div className="exercise-cell"><span className="exercise-number">{String(i+1).padStart(2,"0")}</span><div><strong>{ex.name}</strong><span>{ex.muscle} · {ex.equipment}</span></div><button className="info-button" onClick={()=>setDetailExercise(ex)} title="Exercise instructions">i</button></div><span className="table-value">{item.sets} sets</span><span className="table-value">{ex.reps}</span><span className="table-value">{ex.rest}s</span><button className="row-chevron" onClick={()=>setDetailExercise(ex)}><ChevronRight size={17}/></button></div>})}
        </div>
      </Card>}
      <div className="helper-banner"><div className="helper-symbol"><TrendingUp size={19}/></div><div><strong>Progress one rep at a time.</strong><p>Log your sets after each workout. Forge uses your history to suggest sensible next steps.</p></div></div>
    </>:<>
      <div className="session-header"><div><div className="eyebrow">SESSION IN PROGRESS</div><h2>{session.name}</h2><p className="muted">{session.focus}</p></div><Button variant="secondary" onClick={cancelSession}>Discard</Button></div>
      <div className="session-toolbar"><div className="session-stat"><Clock3 size={17}/><span>Session started</span><strong>{formatTime(elapsed)}</strong></div><div className="rest-timer"><div><span className="eyebrow">REST TIMER</span><strong>{formatTime(restSeconds)}</strong></div><Button variant="secondary" onClick={()=>{if(restSeconds===0)setRestSeconds(90);setRestRunning(!restRunning);}}>{restRunning?<Pause size={15}/>:<Play size={15}/>} {restRunning?"Pause":"Start"}</Button><Button variant="ghost" onClick={()=>{setRestSeconds(0);setRestRunning(false)}}><RotateCcw size={15}/></Button></div></div>
      <div className="session-exercises">{session.exercises.map((exercise,ei)=>{const ex=EXERCISE_BY_ID[exercise.exerciseId];const progression=getProgression(exercise.exerciseId,ex.reps,exercise.sets.length,history);const done=exercise.sets.filter(s=>s.completed).length;return <Card className="session-exercise" key={`${exercise.exerciseId}-${ei}`}><div className="session-exercise-head"><div className="session-ex-title"><span className="exercise-number">{String(ei+1).padStart(2,"0")}</span><div><h3>{ex.name}</h3><p>{ex.muscle} · Target {ex.reps} reps · {ex.rest}s rest</p></div></div><span className="set-count">{done}/{exercise.sets.length} sets</span></div><div className="set-table"><div className="set-table-head"><span>SET</span><span>PREVIOUS</span><span>WEIGHT (KG)</span><span>REPS</span><span>DONE</span><span></span></div>{exercise.sets.map((set,si)=><div className={`set-row ${set.completed?"set-completed":""}`} key={set.id}><span className="set-index">{String(si+1).padStart(2,"0")}</span><span className="previous-performance">{(() => {const prev=[...history].reverse().find(w=>w.completed&&(w.exercises||[]).some(e=>e.exerciseId===exercise.exerciseId));const s=prev?.exercises?.find(e=>e.exerciseId===exercise.exerciseId)?.sets?.find(s=>s.completed);return s?`${s.weight||0} × ${s.reps}`:"—";})()}</span><input aria-label={`${ex.name} set ${si+1} weight`} type="number" min="0" step="0.5" placeholder="0" value={set.weight} onChange={e=>updateSessionSet(ei,si,"weight",e.target.value)}/><input aria-label={`${ex.name} set ${si+1} reps`} type="number" min="0" step="1" placeholder="0" value={set.reps} onChange={e=>updateSessionSet(ei,si,"reps",e.target.value)}/><button className={`complete-set ${set.completed?"complete-set-active":""}`} onClick={()=>updateSessionSet(ei,si,"completed",!set.completed)} aria-label="Mark set complete">{set.completed&&<Check size={15}/>}</button><button className="remove-set" onClick={()=>removeSet(ei,si)} title="Remove set"><X size={14}/></button></div>)}</div><div className="exercise-card-bottom"><div className="exercise-actions"><button className="text-button" onClick={()=>addSet(ei)}><Plus size={14}/> Add set</button><button className="text-button" onClick={()=>{setReplaceTarget(ei);setReplacement(exercise.exerciseId);}}><RotateCcw size={14}/> Replace exercise</button></div><div className={`progression-tip ${progression.status==="Ready to progress"?"tip-positive":""}`}><TrendingUp size={15}/><div><strong>{progression.status}</strong><span>{progression.message}</span></div></div></div></Card>})}</div>
      <div className="finish-bar"><div><strong>{session.exercises.reduce((sum,e)=>sum+e.sets.filter(s=>s.completed).length,0)} sets completed</strong><span>Make sure your logged sets look right before saving.</span></div><Button onClick={finishWorkout}><Save size={16}/> Finish & save workout</Button></div>
    </>}
    {replaceTarget!==null&&<Modal title="Replace exercise" onClose={()=>setReplaceTarget(null)}><p className="muted">Choose a different exercise. This changes only the current session.</p><select className="select replace-select" value={replacement} onChange={e=>setReplacement(e.target.value)}>{EXERCISES.map(ex=><option key={ex.id} value={ex.id}>{ex.name} · {ex.muscle}</option>)}</select><Button className="full-width" onClick={replaceExercise}><Check size={16}/> Replace exercise</Button></Modal>}
    {detailExercise&&<Modal title={detailExercise.name} onClose={()=>setDetailExercise(null)}><div className="exercise-modal-meta"><span>{detailExercise.muscle}</span><span>{detailExercise.equipment}</span><span>{detailExercise.reps} reps</span></div><h4>How to perform it</h4><p className="muted">{detailExercise.instructions}</p><div className="modal-tip"><Target size={17}/><span>Use a controlled range of motion and stop if you feel sharp or unusual pain.</span></div></Modal>}
  </div>;
}

function ProgressPage({workouts,completed,totalVolume,prs,exerciseHistory,selectedExercise,setSelectedExercise,historyFilter,setHistoryFilter,bodyWeights,latestWeight,weightEntry,setWeightEntry,addBodyWeight}) {
  const volumeData=[...completed].slice(-8).map(w=>({date:new Date(w.date).toLocaleDateString(undefined,{month:"short",day:"numeric"}),volume:Math.round(workoutVolume(w))}));
  const bodyData=[...bodyWeights].sort((a,b)=>a.date.localeCompare(b.date)).map(w=>({date:new Date(w.date).toLocaleDateString(undefined,{month:"short",day:"numeric"}),weight:w.weight}));
  const strengthData=exerciseHistory;
  return <div className="page-stack"><SectionTitle eyebrow="YOUR DATA, YOUR PROGRESS" title="Progress overview" action={<div className="range-switch">{[["7","7D"],["30","30D"],["90","90D"],["all","ALL"]].map(([v,l])=><button key={v} className={historyFilter===v?"active":""} onClick={()=>setHistoryFilter(v)}>{l}</button>)}</div>}/>
    <div className="stats-grid progress-stats"><StatCard label="Sessions completed" value={completed.length} detail="Keep building consistency" icon={Dumbbell} accent/><StatCard label="Total training volume" value={totalVolume>=1000?`${(totalVolume/1000).toFixed(1)}k`:Math.round(totalVolume)} detail="kg × reps" icon={Activity}/><StatCard label="Personal records" value={prs.length} detail="Exercises with a logged best" icon={Trophy}/><StatCard label="Body weight" value={latestWeight?`${latestWeight} kg`:"—"} detail="Most recent entry" icon={Weight}/></div>
    <div className="charts-grid"><Card className="chart-card"><div className="card-heading"><div><div className="eyebrow">WORKLOAD</div><h3>Training volume</h3></div><span className="chart-legend"><i/> kg × reps</span></div>{volumeData.length?<ResponsiveContainer width="100%" height={245}><AreaChart data={volumeData} margin={{top:12,right:8,left:-18,bottom:0}}><defs><linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c4f06a" stopOpacity={0.25}/><stop offset="95%" stopColor="#c4f06a" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#292d27" vertical={false}/><XAxis dataKey="date" stroke="#73786f" tickLine={false} axisLine={false} fontSize={11}/><YAxis stroke="#73786f" tickLine={false} axisLine={false} fontSize={11}/><Tooltip contentStyle={{background:"#1b1e19",border:"1px solid #34392f",borderRadius:10,color:"#f4f6ef"}}/><Area type="monotone" dataKey="volume" stroke="#c4f06a" fill="url(#volumeGradient)" strokeWidth={2.5} activeDot={{r:5}}/></AreaChart></ResponsiveContainer>:<EmptyState icon={Activity} title="Your chart starts here" text="Complete a workout with logged sets to see training volume."/>}</Card>
      <Card className="chart-card"><div className="card-heading"><div><div className="eyebrow">STRENGTH TRACKER</div><h3>Exercise progress</h3></div><select className="select compact-select" value={selectedExercise} onChange={e=>setSelectedExercise(e.target.value)}>{EXERCISES.map(ex=><option key={ex.id} value={ex.id}>{ex.name}</option>)}</select></div>{strengthData.length?<ResponsiveContainer width="100%" height={245}><LineChart data={strengthData} margin={{top:12,right:8,left:-18,bottom:0}}><CartesianGrid stroke="#292d27" vertical={false}/><XAxis dataKey="date" stroke="#73786f" tickLine={false} axisLine={false} fontSize={11}/><YAxis stroke="#73786f" tickLine={false} axisLine={false} fontSize={11}/><Tooltip contentStyle={{background:"#1b1e19",border:"1px solid #34392f",borderRadius:10,color:"#f4f6ef"}}/><Line type="monotone" dataKey="weight" stroke="#c4f06a" strokeWidth={2.5} dot={{r:3,fill:"#c4f06a"}} activeDot={{r:5}}/></LineChart></ResponsiveContainer>:<EmptyState icon={TrendingUp} title="No exercise data yet" text="Log this exercise in a workout to see your strength trend."/>}</Card></div>
    <div className="lower-grid"><Card><div className="card-heading"><div><div className="eyebrow">BODY METRICS</div><h3>Body weight</h3></div><span className="unit-label">KG</span></div><form className="weight-form" onSubmit={addBodyWeight}><input className="input" type="number" min="20" max="400" step="0.1" value={weightEntry} onChange={e=>setWeightEntry(e.target.value)} placeholder="Enter current weight"/><Button type="submit"><Plus size={15}/> Add entry</Button></form>{bodyData.length?<ResponsiveContainer width="100%" height={170}><LineChart data={bodyData} margin={{top:10,right:8,left:-18,bottom:0}}><CartesianGrid stroke="#292d27" vertical={false}/><XAxis dataKey="date" stroke="#73786f" tickLine={false} axisLine={false} fontSize={11}/><YAxis domain={["auto","auto"]} stroke="#73786f" tickLine={false} axisLine={false} fontSize={11}/><Tooltip contentStyle={{background:"#1b1e19",border:"1px solid #34392f",borderRadius:10,color:"#f4f6ef"}}/><Line dataKey="weight" stroke="#8ab6ff" strokeWidth={2.5} dot={{r:3}}/></LineChart></ResponsiveContainer>:<p className="empty-inline">Add entries over time to see your body-weight trend.</p>}</Card>
      <Card><div className="card-heading"><div><div className="eyebrow">RECORD BOARD</div><h3>Personal bests</h3></div><Trophy size={18} className="subtle-icon"/></div>{prs.length?<div className="pr-list">{prs.map(pr=><div className="pr-item" key={pr.exerciseId}><div className="pr-icon"><Trophy size={15}/></div><div className="pr-info"><strong>{EXERCISE_BY_ID[pr.exerciseId]?.name}</strong><span>{pr.reps} reps · {new Date(pr.date).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}</span></div><b>{pr.weight} <small>kg</small></b></div>)}</div>:<EmptyState icon={Trophy} title="No personal bests yet" text="Your best logged weights will appear here."/>}</Card></div>
  </div>;
}

function HistoryPage({workouts,setPage,startWorkout}) {
  const sorted=[...workouts].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const [openId,setOpenId]=useState(null);
  return <div className="page-stack"><SectionTitle eyebrow="EVERY SESSION COUNTS" title="Workout history" action={<span className="pill muted-pill">{sorted.length} sessions</span>}/>
    {sorted.length?<div className="history-list">{sorted.map(w=><Card className="history-card" key={w.id}><button className="history-summary" onClick={()=>setOpenId(openId===w.id?null:w.id)}><div className="history-datebox"><strong>{new Date(w.date).toLocaleDateString(undefined,{day:"2-digit"})}</strong><span>{new Date(w.date).toLocaleDateString(undefined,{month:"short"}).toUpperCase()}</span></div><div className="history-main"><strong>{w.name}</strong><span>{w.focus} · {w.exercises.length} exercises</span><small>{new Date(w.date).toLocaleDateString(undefined,{weekday:"long",year:"numeric"})}</small></div><div className="history-volume"><strong>{Math.round(workoutVolume(w)).toLocaleString()}</strong><span>kg × reps</span></div><span className="history-chevron">{openId===w.id?<ChevronDown size={18}/>:<ChevronRight size={18}/>}</span></button>{openId===w.id&&<div className="history-expanded">{w.exercises.map((e,i)=><div className="history-exercise" key={`${e.exerciseId}-${i}`}><strong>{EXERCISE_BY_ID[e.exerciseId]?.name||e.exerciseId}</strong><span>{e.sets.filter(s=>s.completed).map(s=>`${s.weight||0} kg × ${s.reps}`).join(" · ")||"No completed sets"}</span></div>)}<div className="history-expanded-foot"><span><Clock3 size={14}/> {w.durationSeconds?`${Math.floor(w.durationSeconds/60)} min`:"Duration not recorded"}</span><span><Check size={14}/> Saved workout</span></div></div>}</Card>)}</div>:<Card className="large-empty"><div className="empty-illustration"><History size={28}/></div><h3>Your history is a blank page.</h3><p>Once you finish your first workout, it will be saved here so you can review every set and rep.</p><Button onClick={()=>setPage("workout")}>Explore my workout <ChevronRight size={16}/></Button></Card>}
  </div>;
}

function ProfilePage({profile,draft,changeProfile,saveProfile,resetAll,exportData,plan,heightText}) {
  return <div className="page-stack"><SectionTitle eyebrow="YOUR SETUP" title="Profile & preferences" action={<Button variant="secondary" onClick={exportData}><Save size={15}/> Export data</Button>}/>
    <div className="profile-layout"><Card className="profile-card"><div className="profile-hero"><div className="profile-avatar">{(profile.name||"A").slice(0,1).toUpperCase()}</div><div><h3>{profile.name||"Athlete"}</h3><p>{profile.goal} · {profile.experience}</p></div></div><div className="profile-facts"><div><span>HEIGHT</span><strong>{heightText}</strong></div><div><span>CURRENT WEIGHT</span><strong>{profile.weight?`${profile.weight} kg`:"Not set"}</strong></div><div><span>TRAINING DAYS</span><strong>{profile.days} days / week</strong></div></div><div className="profile-note"><Target size={17}/><span>Your workout plan is generated from these preferences. Changing goal, experience, or days will create a fresh plan while preserving workout history.</span></div></Card>
      <Card className="profile-settings"><div className="eyebrow">EDIT PREFERENCES</div><h3>Training preferences</h3><div className="form-field"><label className="field-label">Name</label><input className="input" value={draft.name||""} onChange={e=>changeProfile("name",e.target.value)} placeholder="Your name"/></div><div className="form-field"><label className="field-label">Fitness goal</label><select className="select" value={draft.goal} onChange={e=>changeProfile("goal",e.target.value)}>{["Muscle Gain","Strength","Fat Loss","General Fitness"].map(x=><option key={x}>{x}</option>)}</select></div><div className="form-field"><label className="field-label">Experience</label><select className="select" value={draft.experience} onChange={e=>changeProfile("experience",e.target.value)}>{["Beginner","Intermediate","Advanced"].map(x=><option key={x}>{x}</option>)}</select></div><div className="form-field"><label className="field-label">Workout days per week</label><div className="days-grid compact-days">{[2,3,4,5,6].map(n=><button type="button" key={n} className={`day-choice ${Number(draft.days)===n?"selected":""}`} onClick={()=>changeProfile("days",n)}><strong>{n}</strong><span>days</span></button>)}</div></div><Button onClick={saveProfile} className="full-width"><Check size={16}/> Save preferences</Button></Card></div>
    <Card className="danger-zone"><div><h3>Reset app data</h3><p>This permanently removes your profile, plan, workout history, and body-weight entries from this browser.</p></div><Button variant="danger" onClick={resetAll}><RotateCcw size={15}/> Reset all data</Button></Card>
    <Card className="storage-card"><div className="storage-icon"><Save size={18}/></div><div><strong>Stored on this device</strong><p>Forge uses localStorage in this browser. Export a backup before clearing browser data or switching devices.</p></div></Card>
  </div>;
}

function EmptyState({icon:Icon,title,text}) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={20}/></span><strong>{title}</strong><p>{text}</p></div>;
}
function Modal({title,children,onClose}) {
  return <div className="modal-backdrop" onClick={onClose}><div className="modal-card" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>{title}</h3><button onClick={onClose}><X size={18}/></button></div>{children}</div></div>;
}

export default App;
