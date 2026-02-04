import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, 
  GraduationCap, 
  Gift, 
  Plus, 
  Minus,
  Trash2, 
  ChevronLeft, 
  ShoppingBag,
  Pin,
  Clock,
  Camera,
  Home,
  Image as ImageIcon
} from 'lucide-react';

const FIXED_SUBJECTS = [
  { id: 'it-o', name: 'Italiano Orale' },
  { id: 'it-s', name: 'Italiano Scritto' },
  { id: 'lat-o', name: 'Latino Orale' },
  { id: 'lat-s', name: 'Latino Scritto' },
  { id: 'gre-o', name: 'Greco Orale' },
  { id: 'gre-s', name: 'Greco Scritto' },
  { id: 'mat', name: 'Matematica' },
  { id: 'ing', name: 'Inglese' },
  { id: 'geo', name: 'Geostoria' },
  { id: 'civ', name: 'Ed. Civica' },
  { id: 'fis', name: 'Ed. Fisica' },
  { id: 'sci', name: 'Scienze Naturali' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [credits, setCredits] = useState(() => Number(localStorage.getItem('f_credits')) || 0);
  const [rewards, setRewards] = useState(() => JSON.parse(localStorage.getItem('f_rewards')) || []);
  const [grades, setGrades] = useState(() => JSON.parse(localStorage.getItem('f_grades')) || []);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [pinnedRewardId, setPinnedRewardId] = useState(() => localStorage.getItem('f_pinnedId') || null);
  
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    localStorage.setItem('f_credits', credits);
    localStorage.setItem('f_rewards', JSON.stringify(rewards));
    localStorage.setItem('f_grades', JSON.stringify(grades));
    localStorage.setItem('f_pinnedId', pinnedRewardId || '');
  }, [credits, rewards, grades, pinnedRewardId]);

  const calculateAverage = (subjectId) => {
    const subGrades = grades.filter(g => g.subjectId === subjectId);
    if (subGrades.length === 0) return 0;
    const sum = subGrades.reduce((acc, curr) => acc + parseFloat(curr.value), 0);
    return (sum / subGrades.length).toFixed(2);
  };

  const calculateTotalAverage = () => {
    let totalSum = 0;
    let count = 0;
    FIXED_SUBJECTS.forEach(sub => {
      const subAvg = parseFloat(calculateAverage(sub.id));
      if (subAvg > 0) {
        totalSum += subAvg;
        count++;
      }
    });
    return count === 0 ? 0 : (totalSum / count).toFixed(2);
  };

  const calculateGradeCredits = (val) => {
    const v = parseFloat(val);
    if (v === 10) return 10;
    if (v >= 9.5) return 5;
    if (v >= 9) return 3;
    if (v >= 8.5) return 2;
    if (v >= 8) return 1.5;
    return 0;
  };

  const addGrade = (val) => {
    if (!selectedSubjectId) return;
    const earned = calculateGradeCredits(val);
    const newGrade = { id: Date.now(), subjectId: selectedSubjectId, value: val, creditsEarned: earned, date: new Date().toISOString() };
    setGrades([...grades, newGrade]);
    setCredits(prev => prev + earned);
  };

  const deleteGrade = (id) => {
    const grade = grades.find(g => g.id === id);
    if (grade) {
      setCredits(prev => Math.max(0, prev - grade.creditsEarned));
      setGrades(grades.filter(g => g.id !== id));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const ProgressChart = ({ value }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const numericValue = parseFloat(value) || 0;
    const offset = circumference - ((numericValue / 10) * circumference);
    const color = numericValue >= 8 ? "#fbbf24" : (numericValue >= 6 ? "#10b981" : "#3f3f46");

    return (
      <div className="relative flex items-center justify-center">
        <svg width="90" height="90" className="transform -rotate-90">
          <circle cx="45" cy="45" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
          <circle 
            cx="45" cy="45" r={radius} stroke={color} strokeWidth="6" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{value}</span>
          <span className="text-[7px] uppercase tracking-widest text-zinc-500">Media</span>
        </div>
      </div>
    );
  };

  const pinnedItem = rewards.find(r => String(r.id) === pinnedRewardId);

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 max-w-md mx-auto overflow-x-hidden">
      <style>{`
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .white-logo { filter: brightness(0) invert(1); }
        .glass-input { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); color: white; border-radius: 16px; padding: 12px; outline: none; }
      `}</style>

      {activeTab === 'home' && (
        <div className="p-6 animate-in fade-in duration-500">
          <header className="flex justify-between items-start mb-8 pt-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Foundation</h1>
              <p className="text-amber-500 font-semibold text-sm">No pain, no gain</p>
            </div>
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center overflow-hidden">
               <img src="https://api.dicebear.com/7.x/shapes/svg?seed=F" alt="Logo" className="w-10 h-10 white-logo opacity-80" />
            </div>
          </header>

          <div className="flex gap-4 mb-6">
            <div className="glass rounded-[2rem] p-4 flex-shrink-0 flex items-center justify-center w-32 h-32">
              <ProgressChart value={calculateTotalAverage()} />
            </div>
            <div className="glass rounded-[2rem] flex-1 p-5 flex flex-col justify-center relative overflow-hidden">
              {pinnedItem ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 overflow-hidden border border-white/10">
                    {pinnedItem.image ? (
                      <img src={pinnedItem.image} className="w-full h-full object-cover" alt="pinned" />
                    ) : (
                      <Gift size={20} className="text-amber-500" />
                    )}
                  </div>
                  <p className="text-[10px] uppercase text-zinc-500 truncate w-full text-center">{pinnedItem.name}</p>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-700" style={{ width: `${Math.min(100, (credits / pinnedItem.cost) * 100)}%` }}></div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-500 text-[9px] uppercase tracking-widest mb-1">Crediti</p>
                  <h2 className="text-4xl font-bold text-amber-500">{credits.toFixed(1)}</h2>
                </>
              )}
            </div>
          </div>

          <div className="glass p-6 rounded-[2.5rem] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Sessioni Studio</span>
              <span className="text-xl font-bold tracking-tight">Focus Tracker</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCredits(c => Math.max(0, c - 0.5))} className="glass w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-500 active:scale-90 transition-transform">
                <Minus size={18} />
              </button>
              <button onClick={() => setCredits(c => c + 1)} className="bg-white text-black px-6 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-transform">
                <Clock size={16} /> +1
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="p-6 animate-in slide-in-from-right duration-300">
          {!selectedSubjectId ? (
            <>
              <h2 className="text-2xl font-bold mb-6">Le tue Materie</h2>
              <div className="grid grid-cols-3 gap-3">
                {FIXED_SUBJECTS.map(sub => {
                  const avg = calculateAverage(sub.id);
                  return (
                    <button key={sub.id} onClick={() => setSelectedSubjectId(sub.id)} className="glass p-3 rounded-[1.8rem] flex flex-col items-center gap-2 aspect-square justify-center text-center active:scale-95 transition-transform">
                      <span className={`text-xs font-bold ${avg >= 6 ? 'text-emerald-400' : 'text-zinc-600'}`}>{avg > 0 ? avg : '-'}</span>
                      <span className="text-[9px] text-zinc-400 font-medium leading-tight px-1">{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="animate-in fade-in duration-300">
              <button onClick={() => setSelectedSubjectId(null)} className="flex items-center text-zinc-500 mb-6 text-sm">
                <ChevronLeft size={18} /> Indietro
              </button>
              <h2 className="text-3xl font-bold mb-6">{FIXED_SUBJECTS.find(s => s.id === selectedSubjectId).name}</h2>
              
              <div className="glass p-5 rounded-3xl mb-8">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Aggiungi Voto</p>
                <div className="flex gap-3">
                  <select 
                    className="glass-input flex-1 font-bold text-lg"
                    onChange={(e) => { if(e.target.value) { addGrade(e.target.value); e.target.value = ""; } }}
                  >
                    <option value="">Voto...</option>
                    {[...Array(37)].map((_, i) => {
                      const v = 10 - (i * 0.25);
                      return v >= 1 ? <option key={v} value={v}>{v}</option> : null;
                    })}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {grades.filter(g => g.subjectId === selectedSubjectId).sort((a,b) => b.id - a.id).map(grade => (
                  <div key={grade.id} className="glass p-4 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-emerald-400">{grade.value}</span>
                      {grade.creditsEarned > 0 && <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg">+{grade.creditsEarned} Cr</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-600 text-[10px]">{new Date(grade.id).toLocaleDateString()}</span>
                      <button onClick={() => deleteGrade(grade.id)} className="text-zinc-800 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="p-6 animate-in slide-in-from-right duration-300">
          <div className="glass p-6 rounded-3xl mb-8 bg-gradient-to-br from-zinc-900/50 to-black">
             <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Disponibilità</p>
             <h2 className="text-5xl font-bold text-amber-500">{credits.toFixed(1)} <span className="text-sm font-normal text-zinc-600 uppercase tracking-tighter">Crediti</span></h2>
          </div>

          <h3 className="text-lg font-bold mb-4">Nuovo Premio</h3>
          <div className="glass p-5 rounded-3xl mb-8 space-y-3">
            <input type="text" placeholder="Nome premio..." value={name} onChange={e => setName(e.target.value)} className="w-full glass-input" />
            <div className="flex gap-2">
              <input type="number" placeholder="Costo" value={cost} onChange={e => setCost(e.target.value)} className="w-24 glass-input" />
              <label className="flex-1 glass border border-white/10 rounded-2xl flex items-center justify-center text-zinc-500 cursor-pointer text-sm hover:text-white transition-colors h-12">
                <ImageIcon size={18} className="mr-2"/> {image ? "Foto OK" : "Carica"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <button 
                onClick={() => {
                  if(!name || !cost) return;
                  setRewards([...rewards, { id: Date.now(), name, cost: Number(cost), image }]);
                  setName(''); setCost(''); setImage(null);
                }} 
                className="bg-white text-black px-6 rounded-2xl font-bold active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {rewards.map(reward => (
              <div key={reward.id} className="glass p-3 rounded-[2rem] flex flex-col gap-3 group">
                <div className="aspect-square rounded-2xl bg-zinc-900/50 flex items-center justify-center relative border border-white/5 overflow-hidden">
                  {reward.image ? (
                    <img src={reward.image} className="w-full h-full object-cover" alt={reward.name} />
                  ) : (
                    <Gift size={32} className="text-zinc-800" />
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-amber-500 text-[10px] font-bold">
                    {reward.cost} CR
                  </div>
                  <button 
                    onClick={() => setPinnedRewardId(pinnedRewardId === String(reward.id) ? null : String(reward.id))}
                    className={`absolute top-2 left-2 p-1.5 rounded-lg backdrop-blur-md transition-colors ${pinnedRewardId === String(reward.id) ? 'bg-amber-500 text-black' : 'bg-black/60 text-zinc-600'}`}
                  >
                    <Pin size={12} fill={pinnedRewardId === String(reward.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs truncate text-zinc-300 w-2/3">{reward.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setCredits(c => Math.max(0, c - reward.cost))} className="text-emerald-500 active:scale-125 transition-transform"><Plus size={16}/></button>
                    <button onClick={() => setRewards(rewards.filter(r => r.id !== reward.id))} className="text-zinc-800 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/5 flex justify-around items-center max-w-md mx-auto z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center transition-all ${activeTab === 'home' ? 'text-white' : 'text-zinc-600'}`}>
          <Home size={20} /><span className="text-[9px] mt-1 uppercase font-bold tracking-widest">Dash</span>
        </button>
        <button onClick={() => setActiveTab('subjects')} className={`flex flex-col items-center transition-all ${activeTab === 'subjects' ? 'text-white' : 'text-zinc-600'}`}>
          <GraduationCap size={20} /><span className="text-[9px] mt-1 uppercase font-bold tracking-widest">Voti</span>
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center transition-all ${activeTab === 'shop' ? 'text-white' : 'text-zinc-600'}`}>
          <ShoppingBag size={20} /><span className="text-[9px] mt-1 uppercase font-bold tracking-widest">Shop</span>
        </button>
      </nav>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
