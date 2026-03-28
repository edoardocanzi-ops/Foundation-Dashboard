import React, { useState, useEffect } from 'react';
import { 
  BookOpen, GraduationCap, ShoppingBag, Plus, Minus,
  Trash2, ChevronLeft, ChevronRight, Pin, Clock,
  Camera, Gift, CheckSquare, Check, LineChart as ChartIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const FIXED_SUBJECTS = [
  { id: 'it-o', name: 'Italiano Orale' }, { id: 'it-s', name: 'Italiano Scritto' },
  { id: 'lat-o', name: 'Latino Orale' }, { id: 'lat-s', name: 'Latino Scritto' },
  { id: 'gre-o', name: 'Greco Orale' }, { id: 'gre-s', name: 'Greco Scritto' },
  { id: 'mat', name: 'Matematica' }, { id: 'ing', name: 'Inglese' },
  { id: 'geo', name: 'Geostoria' }, { id: 'civ', name: 'Ed. Civica' },
  { id: 'fis', name: 'Ed. Fisica' }, { id: 'sci', name: 'Scienze Naturali' }
];

const TASK_LEVELS = {
  1: { credits: 0.5, color: '#065f46', name: 'Lv 1', limit: Infinity },
  2: { credits: 1.0, color: '#4ade80', name: 'Lv 2', limit: 6 },
  3: { credits: 1.5, color: '#facc15', name: 'Lv 3', limit: 4 },
  4: { credits: 2.0, color: '#f97316', name: 'Lv 4', limit: 2 },
  5: { credits: 2.5, color: '#ef4444', name: 'Lv 5', limit: 1 }
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  
  const [credits, setCredits] = useState(() => Number(localStorage.getItem('f_credits')) || 0);
  const [grades, setGrades] = useState(() => JSON.parse(localStorage.getItem('f_grades')) || []);
  const [rewards, setRewards] = useState(() => JSON.parse(localStorage.getItem('f_rewards')) || []);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('f_tasks')) || []);
  
  const today = new Date().toISOString().split('T')[0];
  const [newGradeValue, setNewGradeValue] = useState("8.00");
  const [newGradeDate, setNewGradeDate] = useState(today);
  
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [rewardImage, setRewardImage] = useState(null);
  
  const [taskName, setTaskName] = useState("");
  const [taskLevel, setTaskLevel] = useState(1);
  const [taskImage, setTaskImage] = useState(null);

  useEffect(() => {
    localStorage.setItem('f_credits', credits);
    localStorage.setItem('f_grades', JSON.stringify(grades));
    localStorage.setItem('f_rewards', JSON.stringify(rewards));
    localStorage.setItem('f_tasks', JSON.stringify(tasks));
  }, [credits, grades, rewards, tasks]);

  const getColorForGrade = (val) => {
    const v = parseFloat(val);
    if (v >= 8) return "#059669";
    if (v >= 6) return "#4ade80";
    if (v > 0) return "#ef4444";
    return "#3f3f46";
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
    setGrades([...grades, { id: Date.now(), subjectId: selectedSubjectId, value: val, date: newGradeDate }]);
    if (val >= 8) setCredits(c => c + 1.5);
    setNewGradeDate(today);
  };

  const
/* --- INIZIO PARTE 2 --- */
  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto px-6 pt-10 text-white selection:bg-white selection:text-black">
      <header className="mb-10 fade-in flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase italic">Foundation</h1>
          <p className="text-white text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Reward Dashboard</p>
        </div>
      </header>

      <main className="space-y-6">
        {activeTab === 'dashboard' && (
          <>
            <div className="glass-panel p-6 rounded-[2.5rem] fade-in">
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

            <div className="glass-panel p-6 rounded-[2.5rem] fade-in">
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

        {activeTab === 'stats' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-bold text-white">Mercato Voti</h2>
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest flex items-center gap-1">
                <ChartIcon size={12} /> Trend Globale
              </span>
            </div>
            
            <div className="glass-panel p-4 pt-6 rounded-[2.5rem] w-full" style={{ height: '350px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="dateStr" stroke="#52525b" fontSize={10} tickMargin={10} minTickGap={30} />
                    <YAxis domain={[2, 10]} stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                    <ReferenceLine y={6} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} opacity={0.5} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      dot={{ fill: '#000', stroke: '#10b981', strokeWidth: 2, r: 4 }} 
                      activeDot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 2, r: 6 }} 
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 text-xs font-bold uppercase tracking-widest">
                  Dati insufficienti
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-[2.5rem]">
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-bold">Media Ponderata Globale</p>
              <h2 className="text-5xl font-black text-white" style={{ color: getColorForGrade(totalAverage) }}>{totalAverage}</h2>
              <p className="text-zinc-600 text-xs mt-2 font-medium border-t border-white/5 pt-3">
                La linea rossa tratteggiata indica la soglia della sufficienza (6.00).
              </p>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="animate-in fade-in duration-300">
            {!selectedSubjectId ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-3xl font-bold text-white">Materie</h2>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Ordinate per media</span>
                </div>
                
                <div className="space-y-3">
                  {FIXED_SUBJECTS.map(s => {
                    const avgStr = calculateAverage(s.id);
                    const avgNum = parseFloat(avgStr);
                    return { ...s, avgStr, avgNum };
                  })
                  .sort((a, b) => b.avgNum - a.avgNum)
                  .map(s => {
                    const color = getColorForGrade(s.avgStr);
                    return (
                      <button 
                        key={s.id} 
                        onClick={() => setSelectedSubjectId(s.id)} 
                        className="glass-panel p-4 rounded-[2rem] flex items-center justify-between w-full active:scale-95 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative flex items-center justify-center flex-shrink-0">
                             <svg width="48" height="48" className="transform -rotate-90">
                               <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
                               <circle cx="24" cy="24" r="20" stroke={s.avgNum > 0 ? color : '#27272a'} strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (s.avgNum/10 * 125.6)} strokeLinecap="round" />
                             </svg>
                             <span className="absolute text-xs font-bold" style={{ color: s.avgNum > 0 ? color : '#ffffff' }}>{s.avgNum > 0 ? s.avgStr : '-'}</span>
                          </div>
                          <p className="text-white text-sm font-bold text-left tracking-tight group-hover:opacity-70 transition-opacity">{s.name}</p>
                        </div>
                        <ChevronRight size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button onClick={() => setSelectedSubjectId(null)} className="text-zinc-500 flex items-center gap-1 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                  <ChevronLeft size={16} /> Indietro
                </button>
                <h2 className="text-3xl font-bold text-white leading-tight">{FIXED_SUBJECTS.find(s=>s.id === selectedSubjectId).name}</h2>
                
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                  <input 
                    type="date" 
                    value={newGradeDate} 
                    onChange={e => setNewGradeDate(e.target.value)} 
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-white transition-colors [&::-webkit-calendar-picker-indicator]:invert"
                  />
                  <div className="flex gap-3">
                    <select value={newGradeValue} onChange={e => setNewGradeValue(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-xl p-4 text-white font-bold text-center appearance-none outline-none focus:border-white transition-colors">
                      {[...Array(33)].map((_, i) => (10 - i * 0.25).toFixed(2)).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button onClick={addGrade} className="bg-emerald-500 text-black px-8 rounded-xl font-black uppercase tracking-wider active:scale-95 transition-transform shadow-lg shadow-emerald-500/20">Salva</button>
                  </div>
                </div>

                <div className="space-y-3">
                  {grades.filter(g => g.subjectId === selectedSubjectId).reverse().map(g => (
                    <div key={g.id} className="glass-panel p-4 rounded-2xl flex justify-between items-center border-l-4" style={{ borderColor: getColorForGrade(g.value) }}>
                      <div>
                        <span className="font-black text-2xl block leading-none" style={{ color: getColorForGrade(g.value) }}>{g.value}</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 block">{g.date ? g.date : 'N/D'}</span>
                      </div>
                      <button onClick={() => setGrades(grades.filter(x => x.id !== g.id))} className="text-zinc-700 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
/* --- FINE PARTE 2 --- */
            /* --- INIZIO PARTE 3 --- */
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
                        style={{ backgroundColor: info.color + '40' }}
                      >
                        <div className="w-4 h-4 rounded-full mb-1" style={{ backgroundColor: info.color }}></div>
                        <span className="text-[10px] font-black" style={{ color: isSelected ? '#fff' : info.color }}>{info.credits}</span>
                      </button>
                    )
                  })}
                </div>
                
                <div className="mt-3 flex justify-between px-1">
                  {[1, 2, 3, 4, 5].map(lvl => {
                    const count = getTaskCountForMonth(lvl);
                    const limit = TASK_LEVELS[lvl].limit;
                    const isMaxed = count >= limit;
                    return (
                      <span key={lvl} className={`text-[8px] font-bold ${isMaxed ? 'text-red-500' : 'text-zinc-500'}`}>
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

            <div className="space-y-4">
              {tasks.map(t => {
                const info = TASK_LEVELS[t.level];
                return (
                  <div key={t.id} className={`glass-panel p-3 rounded-[2rem] flex items-center gap-4 transition-all ${t.completed ? 'opacity-50' : ''}`}>
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 flex-shrink-0" style={{ borderColor: info.color }}>
                      {t.image ? <img src={t.image} className="w-full h-full object-cover" /> : <CheckSquare size={20} style={{ color: info.color }} />}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
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

        {activeTab === 'shop' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold text-white">Shop</h2>
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <input type="text" placeholder="Nuovo obiettivo..." value={rewardName} onChange={e => setRewardName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl font-medium text-white outline-none focus:border-white transition-colors placeholder:text-zinc-700" />
              <div className="flex gap-2">
                <input type="number" placeholder="CR" value={rewardCost} onChange={e => setRewardCost(e.target.value)} className="w-24 bg-black border border-white/10 p-4 rounded-xl text-center font-bold text-white outline-none placeholder:text-zinc-700" />
                <label className="flex-1 glass-panel rounded-xl flex items-center justify-center cursor-pointer text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
                  <Camera size={16} className="mr-2"/> {rewardImage ? "FOTO OK" : "CARICA"}
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, setRewardImage)} accept="image/*" />
                </label>
                <button onClick={() => {
                  if(!rewardName || !rewardCost) return;
                  setRewards([...rewards, { id: Date.now(), name: rewardName, cost: Number(rewardCost), image: rewardImage, pinned: false }]);
                  setRewardName(""); setRewardCost(""); setRewardImage(null);
                }} className="bg-white text-black px-5 rounded-xl font-bold active:scale-95 transition-transform"><Plus size={20} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {rewards.map(r => (
                <div key={r.id} className="glass-panel p-4 rounded-[2.2rem] relative flex flex-col group">
                  <button onClick={() => togglePin(r.id)} className={`absolute top-5 left-5 z-10 p-2 rounded-full backdrop-blur-md transition-all ${r.pinned ? 'bg-white text-black' : 'bg-black/60 text-zinc-500 hover:text-white'}`}>
                    <Pin size={12} fill={r.pinned ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setRewards(rewards.filter(x => x.id !== r.id))} className="absolute top-5 right-5 z-10 p-2 text-zinc-800 hover:text-red-500"><Trash2 size={12} /></button>
                  <div className="aspect-square rounded-2xl bg-black border border-white/5 flex items-center justify-center overflow-hidden mb-4 shadow-xl">
                    {r.image ? <img src={r.image} className="w-full h-full object-cover" /> : <Gift size={32} className="text-zinc-900" />}
                  </div>
                  <div className="px-1">
                    <p className="text-xs font-bold truncate text-white mb-2">{r.name}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-black text-xs italic">{r.cost} CR</span>
                      <button onClick={() => credits >= r.cost && setCredits(c => c - r.cost)} disabled={credits < r.cost} className={`text-[9px] font-bold uppercase tracking-tighter px-3 py-2 rounded-full transition-all ${credits >= r.cost ? 'bg-emerald-500 text-black active:scale-90 shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-zinc-800 cursor-not-allowed'}`}>Riscatta</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-4 right-4 h-20 glass-panel rounded-[2.5rem] flex justify-between items-center px-4 max-w-md mx-auto z-50 shadow-2xl">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-zinc-600'}`}>
           <BookOpen size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${activeTab === 'stats' ? 'text-emerald-500 scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-zinc-600'}`}>
           <ChartIcon size={22} strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
        </button>
        <button onClick={() => {setActiveTab('subjects'); setSelectedSubjectId(null);}} className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${activeTab === 'subjects' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-zinc-600'}`}>
           <GraduationCap size={22} strokeWidth={activeTab === 'subjects' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveTab('tasks')} className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${activeTab === 'tasks' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-zinc-600'}`}>
           <CheckSquare size={22} strokeWidth={activeTab === 'tasks' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${activeTab === 'shop' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-zinc-600'}`}>
           <ShoppingBag size={22} strokeWidth={activeTab === 'shop' ? 2.5 : 2} />
        </button>
      </nav>
    </div>
  );
};

export default App;
/* --- FINE PARTE 3 --- */

  
