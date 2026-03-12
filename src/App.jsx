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
  Gift
} from 'lucide-react';

const FIXED_SUBJECTS = [
  { id: 'it-o', name: 'Italiano Orale' }, { id: 'it-s', name: 'Italiano Scritto' },
  { id: 'lat-o', name: 'Latino Orale' }, { id: 'lat-s', name: 'Latino Scritto' },
  { id: 'gre-o', name: 'Greco Orale' }, { id: 'gre-s', name: 'Greco Scritto' },
  { id: 'mat', name: 'Matematica' }, { id: 'ing', name: 'Inglese' },
  { id: 'geo', name: 'Geostoria' }, { id: 'civ', name: 'Ed. Civica' },
  { id: 'fis', name: 'Ed. Fisica' }, { id: 'sci', name: 'Scienze Naturali' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [credits, setCredits] = useState(() => Number(localStorage.getItem('f_credits')) || 0);
  const [grades, setGrades] = useState(() => JSON.parse(localStorage.getItem('f_grades')) || []);
  const [rewards, setRewards] = useState(() => JSON.parse(localStorage.getItem('f_rewards')) || []);
  
  const [newGradeValue, setNewGradeValue] = useState("8.00");
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [rewardImage, setRewardImage] = useState(null);

  useEffect(() => {
    localStorage.setItem('f_credits', credits);
    localStorage.setItem('f_grades', JSON.stringify(grades));
    localStorage.setItem('f_rewards', JSON.stringify(rewards));
  }, [credits, grades, rewards]);

  // LOGICA COLORI VITI
  const getColorForGrade = (val) => {
    const v = parseFloat(val);
    if (v >= 8) return "#059669"; // Verde Scuro
    if (v >= 6) return "#4ade80"; // Verde Chiaro
    if (v > 0) return "#ef4444";  // Rosso
    return "#3f3f46";             // Grigio
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

  const togglePin = (id) => {
    setRewards(rewards.map(r => ({ ...r, pinned: r.id === id ? !r.pinned : false })));
  };

  const pinnedReward = rewards.find(r => r.pinned);

  // GRAFICO A TORTA PER LA HOME
  const AveragePieChart = ({ value }) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const progress = (parseFloat(value) / 10) * circumference;
    const color = getColorForGrade(value);
    
    return (
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="7" fill="transparent" />
          <circle 
            cx="48" cy="48" r={radius} stroke={color} strokeWidth="7" fill="transparent" 
            strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" 
            className="transition-all duration-1000 ease-out" 
          />
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
        {activeTab === 'dashboard' && (
          <>
            {/* WIDGET CREDITI E PIE CHART */}
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

            {/* WIDGET OBIETTIVO PINNATO */}
            <div className="glass-panel p-6 rounded-[2.5rem]">
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-5 font-bold flex items-center gap-2">
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

        {activeTab === 'subjects' && (
          <div className="animate-in fade-in duration-300">
            {!selectedSubjectId ? (
              <div className="grid grid-cols-2 gap-4">
                {FIXED_SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => setSelectedSubjectId(s.id)} className="glass-panel p-5 rounded-[2.2rem] flex flex-col items-center justify-center active:scale-95 transition-all group">
                    <SmallProgressChart value={calculateAverage(s.id)} />
                    <p className="text-white text-[10px] uppercase font-bold text-center tracking-tight leading-tight group-hover:opacity-70 transition-opacity">{s.name}</p>
                  </button>
                ))}
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

        {activeTab === 'shop' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold text-white">Shop</h2>
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <input type="text" placeholder="Nuovo obiettivo..." value={rewardName} onChange={e => setRewardName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl font-medium text-white outline-none focus:border-white transition-colors placeholder:text-zinc-700" />
              <div className="flex gap-2">
                <input type="number" placeholder="CR" value={rewardCost} onChange={e => setRewardCost(e.target.value)} className="w-24 bg-black border border-white/10 p-4 rounded-xl text-center font-bold text-white outline-none placeholder:text-zinc-700" />
                <label className="flex-1 glass-panel rounded-xl flex items-center justify-center cursor-pointer text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
                  <Camera size={16} className="mr-2"/> {rewardImage ? "Immagine OK" : "Carica"}
                  <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setRewardImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} accept="image/*" />
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
                  <button onClick={() => setRewards(rewards.filter(x => x.id !== r.id))} className="absolute top-5 right-5 z-10 p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
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

      {/* NAV BAR */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 glass-panel rounded-[2.5rem] flex justify-around items-center px-4 max-w-md mx-auto z-50 shadow-2xl">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'dashboard' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-zinc-600'}`}>
           <BookOpen size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
        </button>
        <button onClick={() => {setActiveTab('subjects'); setSelectedSubjectId(null);}} className={`flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'subjects' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-zinc-600'}`}>
           <GraduationCap size={24} strokeWidth={activeTab === 'subjects' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'shop' ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'text-zinc-600'}`}>
           <ShoppingBag size={24} strokeWidth={activeTab === 'shop' ? 2.5 : 2} />
        </button>
      </nav>
    </div>
  );
};

export default App;

                      
