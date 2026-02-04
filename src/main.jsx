import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // import React, { useState, useEffect } from 'react';
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
  
  // Form stati
  const [newGradeValue, setNewGradeValue] = useState("8.00");
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [rewardImage, setRewardImage] = useState(null);

  useEffect(() => {
    localStorage.setItem('f_credits', credits);
    localStorage.setItem('f_grades', JSON.stringify(grades));
    localStorage.setItem('f_rewards', JSON.stringify(rewards));
  }, [credits, grades, rewards]);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRewardImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const togglePin = (id) => {
    setRewards(rewards.map(r => {
      if (r.id === id) return { ...r, pinned: !r.pinned };
      return { ...r, pinned: false }; // Solo una ricompensa pinnata alla volta per il widget
    }));
  };

  const gradeOptions = [];
  for (let v = 10; v >= 2; v -= 0.25) gradeOptions.push(v.toFixed(2));

  const pinnedReward = rewards.find(r => r.pinned);

  // Componente Pie Chart per la Media
  const AveragePieChart = ({ value }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const progress = (parseFloat(value) / 10) * circumference;
    
    return (
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="text-emerald-500 transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold leading-none">{value}</span>
          <span className="text-[8px] uppercase text-zinc-500 font-bold tracking-tighter">Media</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 max-w-md mx-auto font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-start mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Foundation</h1>
          <p className="text-white text-xs font-bold uppercase tracking-widest italic opacity-60">Reward Dashboard</p>
        </div>
        <div className="w-10 h-10 bg-white rounded-lg rotate-45 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-zinc-900 scale-90 rounded-sm"></div>
        </div>
      </header>

      <main className="transition-all duration-300">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Widget Principale con Pie Chart e Crediti */}
            <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-bold">Crediti Totali</p>
                  <h2 className="text-5xl font-bold text-white">{credits.toFixed(1)}</h2>
                </div>
                <AveragePieChart value={totalAverage} />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setCredits(c => c + 1)} className="flex-1 bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-white/5">
                  <Clock size={18}/> +1 Sessione
                </button>
                <button onClick={() => setCredits(c => Math.max(0, c - 1))} className="w-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-500 active:scale-95 hover:text-white transition-all">
                  <Minus size={20}/>
                </button>
              </div>
            </div>

            {/* Widget Ricompensa Pinnata */}
            <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/10">
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-4 font-bold">Obiettivo Corrente</p>
              {pinnedReward ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 overflow-hidden flex-shrink-0">
                    {pinnedReward.image ? (
                      <img src={pinnedReward.image} className="w-full h-full object-cover" alt="pinned" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <Gift size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <h4 className="font-bold text-sm truncate">{pinnedReward.name}</h4>
                      <span className="text-[10px] font-bold text-white/50">{credits.toFixed(0)} / {pinnedReward.cost} CR</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-700" 
                        style={{ width: `${Math.min(100, (credits / pinnedReward.cost) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-zinc-600 text-xs italic">Nessun premio pinnato nello shop</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="animate-in fade-in">
            {!selectedSubjectId ? (
              <div className="grid grid-cols-2 gap-3">
                {FIXED_SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => setSelectedSubjectId(s.id)} className="bg-zinc-900/40 p-5 rounded-3xl text-left border border-white/5 hover:bg-zinc-900/60 transition-colors">
                    <p className="text-white font-bold text-lg">{calculateAverage(s.id)}</p>
                    <p className="text-zinc-400 text-[10px] uppercase font-black mt-1 tracking-tight">{s.name}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <button onClick={() => setSelectedSubjectId(null)} className="text-zinc-500 flex items-center gap-1 text-sm font-bold"><ChevronLeft size={16}/> Indietro</button>
                <h2 className="text-2xl font-bold">{FIXED_SUBJECTS.find(s=>s.id === selectedSubjectId).name}</h2>
                
                <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/10 space-y-3">
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Inserimento Voto</p>
                  <div className="flex gap-2">
                    <select 
                        value={newGradeValue} 
                        onChange={e => setNewGradeValue(e.target.value)} 
                        className="flex-1 bg-black border border-white/10 rounded-xl p-3 text-white appearance-none text-center font-bold"
                    >
                      {gradeOptions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button onClick={addGrade} className="bg-white text-black px-8 rounded-xl font-bold active:scale-95 transition-transform">Salva</button>
                  </div>
                </div>

                <div className="space-y-2">
                  {grades.filter(g => g.subjectId === selectedSubjectId).reverse().map(g => (
                    <div key={g.id} className="bg-zinc-900/30 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                      <span className="font-bold text-lg text-emerald-400">{g.value}</span>
                      <button onClick={() => setGrades(grades.filter(x => x.id !== g.id))} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold">Shop Ricompense</h2>
            
            <div className="bg-zinc-900/50 p-5 rounded-3xl border border-white/10 space-y-3">
              <input 
                type="text" 
                placeholder="Nome premio..." 
                value={rewardName} 
                onChange={e => setRewardName(e.target.value)} 
                className="w-full bg-black border border-white/10 p-3 rounded-xl placeholder:text-zinc-700" 
              />
              <div className="flex gap-2">
                <input 
                    type="number" 
                    placeholder="Costo" 
                    value={rewardCost} 
                    onChange={e => setRewardCost(e.target.value)} 
                    className="w-24 bg-black border border-white/10 p-3 rounded-xl text-center font-bold" 
                />
                <label className="flex-1 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer text-xs text-zinc-500 hover:text-white transition-colors">
                  <Camera size={16} className="mr-2"/> {rewardImage ? "Immagine OK" : "Carica Foto"}
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
                <button 
                    onClick={() => {
                        if(!rewardName || !rewardCost) return;
                        setRewards([...rewards, { id: Date.now(), name: rewardName, cost: Number(rewardCost), image: rewardImage, pinned: false }]);
                        setRewardName(""); setRewardCost(""); setRewardImage(null);
                    }} 
                    className="bg-white text-black px-4 rounded-xl font-bold active:scale-95"
                >
                    <Plus size={20}/>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {rewards.map(r => (
                <div key={r.id} className="bg-zinc-900/40 p-3 rounded-[2rem] border border-white/5 relative group">
                  <button 
                    onClick={() => togglePin(r.id)} 
                    className={`absolute top-4 left-4 z-10 p-2 rounded-full backdrop-blur-md transition-all ${r.pinned ? 'bg-white text-black' : 'bg-black/60 text-zinc-500 hover:text-white'}`}
                  >
                    <Pin size={12} fill={r.pinned ? "currentColor" : "none"}/>
                  </button>
                  
                  <div className="aspect-square rounded-2xl bg-zinc-950 overflow-hidden border border-white/5">
                    {r.image ? (
                        <img src={r.image} className="w-full h-full object-cover" alt={r.name} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-zinc-800">
                            <ShoppingBag size={32}/>
                        </div>
                    )}
                  </div>
                  
                  <div className="px-1 mt-3">
                    <p className="text-xs font-bold truncate">{r.name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white font-black text-sm">{r.cost} CR</span>
                      <button 
                        onClick={() => credits >= r.cost && setCredits(c => c - r.cost)} 
                        disabled={credits < r.cost} 
                        className={`text-[10px] font-black px-3 py-1.5 rounded-full transition-all ${credits >= r.cost ? 'bg-emerald-500 text-black active:scale-90' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                      >
                        RISCATTA
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setRewards(rewards.filter(x => x.id !== r.id))} 
                    className="absolute top-4 right-4 bg-black/60 p-2 rounded-full text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={12}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* NAVIGATION */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-zinc-900/80 backdrop-blur-2xl rounded-[2.5rem] flex justify-around items-center px-4 max-w-md mx-auto border border-white/10 shadow-2xl">
        <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-white scale-110' : 'text-zinc-600'}`}
        >
          <BookOpen size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2}/>
          <span className="text-[8px] font-bold uppercase tracking-widest">Home</span>
        </button>
        
        <button 
            onClick={() => {setActiveTab('subjects'); setSelectedSubjectId(null);}} 
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'subjects' ? 'text-white scale-110' : 'text-zinc-600'}`}
        >
          <GraduationCap size={24} strokeWidth={activeTab === 'subjects' ? 2.5 : 2}/>
          <span className="text-[8px] font-bold uppercase tracking-widest">Materie</span>
        </button>
        
        <button 
            onClick={() => setActiveTab('shop')} 
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'shop' ? 'text-white scale-110' : 'text-zinc-600'}`}
        >
          <ShoppingBag size={24} strokeWidth={activeTab === 'shop' ? 2.5 : 2}/>
          <span className="text-[8px] font-bold uppercase tracking-widest">Shop</span>
        </button>
      </nav>
    </div>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

