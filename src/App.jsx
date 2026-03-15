import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  ShoppingBag,
  Plus, 
  Minus,
  Trash2, 
  ChevronLeft, 
  Pin,
  Clock,
  Camera,
  Gift,
  CheckSquare,
  Check
} from 'lucide-react';

const FIXED_SUBJECTS = [
  { id: 'it-o', name: 'Italiano Orale' }, { id: 'it-s', name: 'Italiano Scritto' },
  { id: 'lat-o', name: 'Latino Orale' }, { id: 'lat-s', name: 'Latino Scritto' },
  { id: 'gre-o', name: 'Greco Orale' }, { id: 'gre-s', name: 'Greco Scritto' },
  { id: 'mat', name: 'Matematica' }, { id: 'ing', name: 'Inglese' },
  { id: 'geo', name: 'Geostoria' }, { id: 'civ', name: 'Ed. Civica' },
  { id: 'fis', name: 'Ed. Fisica' }, { id: 'sci', name: 'Scienze Naturali' }
];

const TASK_LEVELS = {
  1: { credits: 0.5, color: '#065f46', name: 'Lv 1', limit: Infinity }, // Dark Green
  2: { credits: 1.0, color: '#4ade80', name: 'Lv 2', limit: 6 },        // Light Green
  3: { credits: 1.5, color: '#facc15', name: 'Lv 3', limit: 4 },        // Yellow
  4: { credits: 2.0, color: '#f97316', name: 'Lv 4', limit: 2 },        // Orange
  5: { credits: 2.5, color: '#ef4444', name: 'Lv 5', limit: 1 }         // Red
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  
  // Storage States
  const [credits, setCredits] = useState(() => Number(localStorage.getItem('f_credits')) || 0);
  const [grades, setGrades] = useState(() => JSON.parse(localStorage.getItem('f_grades')) || []);
  const [rewards, setRewards] = useState(() => JSON.parse(localStorage.getItem('f_rewards')) || []);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('f_tasks')) || []);
  
  // Forms States
  const [newGradeValue, setNewGradeValue] = useState("8.00");
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [rewardImage, setRewardImage] = useState(null);
  
  const [taskName, setTaskName] = useState("");
  const [taskLevel, setTaskLevel] = useState(1);
  const [taskImage, setTaskImage] = useState(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('f_credits', credits);
    localStorage.setItem('f_grades', JSON.stringify(grades));
    localStorage.setItem('f_rewards', JSON.stringify(rewards));
    localStorage.setItem('f_tasks', JSON.stringify(tasks));
  }, [credits, grades, rewards, tasks]);

  // --- LOGIC: GRADES ---
  const getColorForGrade = (val) => {
    const v = parseFloat(val);
    if (v >= 8) return "#059669"; // Dark Green
    if (v >= 6) return "#4ade80"; // Light Green
    if (v > 0) return "#ef4444";  // Red
    return "#3f3f46";             // Gray
  };

  const calculateAverage = (id) => {
    const subGrades = grades.filter(g => g.subjectId === id);
    return subGrades.length ? (subGrades.reduce((a, b) => a + parseFloat(b.value), 0) / subGrades.length).toFixed(2) : "0.00";
  };

  const totalAverage = grades.length 
    ? (grades.reduce((a, b) => a + parseFloat(b.value), 0) / grades.length).toFixed(2) 
    : "0.00";

  const addGrade = () => {
    const val = parseFloat(newGradeValue);
    setGrades([...grades, { id: Date.now(), subjectId: selectedSubjectId, value: val }]);
    if (val >= 8) setCredits(c => c + 1.5);
  };

  const gradeOptions = [];
  for (let v = 10; v >= 2; v -= 0.25) gradeOptions.push(v.toFixed(2));

  // --- LOGIC: REWARDS ---
  const togglePin = (id) => {
    setRewards(rewards.map(r => ({ ...r, pinned: r.id === id ? !r.pinned : false })));
  };
  const pinnedReward = rewards.find(r => r.pinned);

  // --- LOGIC: TASKS ---
  const currentMonth = new Date().toISOString().slice(0, 7); // Returns "YYYY-MM"
  
  const getTaskCountForMonth = (level) => {
    return tasks.filter(t => t.level === level && t.month === currentMonth).length;
  };

  const canAddTask = (level) => {
    return getTaskCountForMonth(level) < TASK_LEVELS[level].limit;
  };

  const addTask = () => {
    if (!taskName || !canAddTask(taskLevel)) return;
    const newTask = {
      id: Date.now(),
      name: taskName,
      level: taskLevel,
      image: taskImage,
      completed: false,
      month: currentMonth
    };
    setTasks([newTask, ...tasks]);
    setTaskName("");
    setTaskImage(null);
    setTaskLevel(1);
  };

  const completeTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return;
    setCredits(c => c + TASK_LEVELS[task.level].credits);
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: true } : t));
  };

  // --- GENERIC IMAGE UPLOAD ---
  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- CHARTS ---
  const AveragePieChart = ({ value }) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const progress = (parseFloat(value) / 10) * circumference;
    const color = getColorForGrade(value);
    return (
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="7" fill="transparent" />
          <circle cx="48" cy="48" r={radius} stroke={color} strokeWidth="7" fill="transparent" strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold leading-none text-white">{value > 0 ? value : '-'}</span>
          <span className="text-[8px] uppercase text-zinc-500 font-bold tracking-widest mt-1">Media</span>
        </div>
      </div>
    );
  };

  const SmallProgressChart = ({ value }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const progress = (parseFloat(value) / 10) * circumference;
    const color = getColorForGrade(value);
    return (
      <div className="relative flex items-center justify-center mb-2">
        <svg width="52" height="52" className="transform -rotate-90">
          <circle cx="26" cy="26" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
          <circle cx="26" cy="26" r={radius} stroke={color} strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color: value > 0 ? color : '#52525b' }}>{value > 0 ? value : '-'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto px-6 pt-10 text-white selection:bg-white selection:text-black">
      {/* HEADER */}
      <header className="mb-10 fade-in flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase italic">Foundation</h1>
          <p className="text-white text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Reward Dashboard</p>
        </div>
      </header>

      <main className="space-y-6">
        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <>
            <div className="glass-panel p-6 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-bold">Crediti Totali</p>
                  <h2 className="text-6xl font-black text-white leading-none">{credits.toFixed(1)}</h2>
                </div>
                <AveragePieChart value={totalAverage} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCredits(c => c + 1)} className="flex-1 bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-white/5">
                  <Clock size={18} /> +1 Sessione
                </button>
                <button onClick={() => setCredits(c => Math.max(0, c - 1))} className="w-16 glass-panel rounded-2xl flex items-center justify-center text-zinc-600 active:scale-95 transition-colors">
                  <Minus size={20} />
                </button>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-[2.5rem]">
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-5 font-bold flex items-center gap-2 text-white/50">
                <Pin size={12} fill="currentColor" /> Obiettivo Attuale
              </p>
              {pinnedReward ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                    {pinnedReward.image ? <img src={pinnedReward.image} className="w-full h-full object-cover" /> : <Gift size={24} className="text-zinc-800" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-2">
                      <h4 className="font-bold text-sm text-white truncate">{pinnedReward.name}</h4>
                      <span className="text-[10px] font-bold text-zinc-500">{credits.toFixed(0)} / {pinnedReward.cost} CR</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-1000 ease-in-out" style={{ width: `${Math.min(100, (credits / pinnedReward.cost) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center border border-dashed border-white/10 rounded-2xl text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
                  Nessun premio pinnato
                </div>
              )}
            </div>
          </>
        )}

        {/* --- SUBJECTS TAB --- */}
        {activeTab === 'subjects' && (
          <div className="animate-in fade-in duration-300">
            {!selectedSubjectId ? (
              <div className="grid grid-cols-2 gap-4">
                {FIXED_SUBJECTS.map(s => {
                  const avg = calculateAverage(s.id);
                  const color = getColorForGrade(avg);
                  return (
                    <button key={s.id} onClick={() => setSelectedSubjectId(s.id)} className="glass-panel p-5 rounded-[2.2rem] flex flex-col items-center justify-center active:scale-95 transition-all group">
                      <SmallProgressChart value={avg} />
                      <p className="text-white text-[10px] uppercase font-bold text-center tracking-tight leading-tight group-hover:opacity-70 transition-opacity">{s.name}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                <button onClick={() => setSelectedSubjectId(null)} className="text-zinc-500 flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                  <ChevronLeft size={16} /> Indietro
                </button>
                <h2 className="text-3xl font-bold text-white">{FIXED_SUBJECTS.find(s=>s.id === selectedSubjectId).name}</h2>
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <div className="flex gap-3">
                    <select value={newGradeValue} onChange={e => setNewGradeValue(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-xl p-4 text-white font-bold text-center appearance-none outline-none focus:border-white transition-colors">
                      {[...Array(33)].map((_, i) => (10 - i * 0.25).toFixed(2)).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button onClick={addGrade} className="bg-white text-black px-8 rounded-xl font-bold active:scale-95 transition-transform">Salva</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {grades.filter(g => g.subjectId === selectedSubjectId).reverse().map(g => (
                    <div key={g.id} className="glass-panel p-5 rounded-2xl flex justify-between items-center border-l-4" style={{ borderColor: getColorForGrade(g.value) }}>
                      <span className="font-black text-2xl" style={{ color: getColorForGrade(g.value) }}>{g.value}</span>
                      <button onClick={() => setGrades(grades.filter(x => x.id !== g.id))} className="text-zinc-800 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TASKS TAB --- */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-bold text-white">Tasks</h2>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">{currentMonth}</span>
            </div>
            
            <div className="glass-panel p-6 rounded-3xl space-y-5">
              <input type="text" placeholder="Nome del task..." value={taskName} onChange={e => setTaskName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl font-medium text-white outline-none focus:border-white transition-colors placeholder:text-zinc-700" />
              
              <div className="flex gap-2">
                <label className="flex-1 glass-panel rounded-xl flex items-center justify-center cursor-pointer text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors py-3">
                  <Camera size={16} className="mr-2"/> {taskImage ? "FOTO OK" : "AGGIUNGI FOTO"}
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, setTaskImage)} accept="image/*" />
                </label>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">Seleziona Livello</p>
                <div className="flex gap-2 justify-between">
                  {[1, 2, 3, 4, 5].map(lvl => {
                    const info = TASK_LEVELS[lvl];
                    const isAvailable = canAddTask(lvl);
                    const isSelected = taskLevel === lvl;
                    return (
                      <button 
                        key={lvl}
                        onClick={() => isAvailable && setTaskLevel(lvl)}
                        disabled={!isAvailable}
                        className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${!isAvailable ? 'opacity-30 cursor-not-allowed border-transparent' : isSelected ? 'border-white scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        style={{ backgroundColor: info.color + '40' }} // 40 is hex for 25% opacity background
                      >
                        <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: info.color }}></div>
                        <span className="text-[10px] font-black">{info.credits}</span>
                      </button>
                    )
                  })}
                </div>
                
                {/* Visual Tracker of Monthly Limits */}
                <div className="mt-3 flex justify-between px-1">
                  {[1, 2, 3, 4, 5].map(lvl => {
                    const count = getTaskCountForMonth(lvl);
                    const limit = TASK_LEVELS[lvl].limit;
                    return (
                      <span key={lvl} className="text-[8px] font-bold text-zinc-500">
                        {limit === Infinity ? '∞' : `${count}/${limit}`}
                      </span>
                    )
                  })}
                </div>
              </div>

              <button onClick={addTask} disabled={!taskName || !canAddTask(taskLevel)} className="w-full bg-white text-black py-4 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                <Plus size={18} /> Crea Task
              </button>
            </div>

            {/* List of Tasks */}
            <div className="space-y-4">
              {tasks.map(t => {
                const info = TASK_LEVELS[t.level];
                return (
                  <div key={t.id} className={`glass-panel p-3 rounded-[2rem] flex items-center gap-4 transition-all ${t.completed ? 'opacity-50' : ''}`}>
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 flex-shrink-0" style={{ borderColor: info.color }}>
                      {t.image ? <img src={t.image} className="w-full h-full object-cover" /> : <CheckSquare size={20} style={{ color: info.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-bold truncate ${t.completed ? 'line-through text-zinc-500' : 'text-white'}`}>{t.name}</p>
                        <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-zinc-700 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: info.color }}>{info.name} • {info.credits} CR</span>
                        {!t.completed ? (
                          <button onClick={() => completeTask(t.id)} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors">
                            COMPLETA
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><Check size={12}/> FATTO</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {tasks.length === 0 && (
                <div className="text-center py-8 text-zinc-600 text-xs font-bold uppercase tracking-widest">
                  Nessun task creato
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- SHOP TAB --- */}
        {activeTab === 'shop' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold text-white">Shop</h2>
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <input type="text" placeholder="Nuovo obiettivo..." value={rewardName} onChange={e => setRewardName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl font-medium text-white outline-none focus:border-white transition-colors placeholder:text-zinc-700" />
              <div className="flex gap-2">
                <input type="number" placeholder="CR" value={rewardCost} onChange={e => setRewardCost(e.target.value)} className="w-24 bg-black border border-white/10 p-4 roun