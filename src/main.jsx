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
  Home
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [credits, setCredits] = useState(() => Number(localStorage.getItem('f_credits')) || 0);
  const [rewards, setRewards] = useState(() => JSON.parse(localStorage.getItem('f_rewards')) || []);
  const [pinnedId, setPinnedId] = useState(localStorage.getItem('f_pinned'));

  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    localStorage.setItem('f_credits', credits);
    localStorage.setItem('f_rewards', JSON.stringify(rewards));
    if (pinnedId) localStorage.setItem('f_pinned', pinnedId);
  }, [credits, rewards, pinnedId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addReward = () => {
    if (!name || !cost) return;
    const newReward = { id: Date.now(), name, cost: Number(cost), image };
    setRewards([...rewards, newReward]);
    setName(''); setCost(''); setImage(null);
  };

  const deleteReward = (id) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 max-w-md mx-auto">
      <style>{`
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .white-logo { filter: brightness(0) invert(1); }
      `}</style>

      {activeTab === 'home' && (
        <div className="p-6 animate-in fade-in duration-500">
          <header className="flex justify-between items-start mb-10 pt-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Foundation</h1>
              <p className="text-amber-500 font-semibold mt-1">No pain, no gain</p>
            </div>
            <img src="https://files.oaiusercontent.com/file-X9pXFpX9pXFpX9pXFpX9pXFp" className="w-12 h-12 white-logo opacity-80" />
          </header>

          <div className="glass p-8 rounded-[2.5rem] text-center mb-6">
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-2">Crediti Accumulati</p>
            <h2 className="text-6xl font-bold text-amber-500 mb-6">{credits.toFixed(1)}</h2>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setCredits(c => Math.max(0, c - 1))} className="glass w-14 h-14 rounded-2xl flex items-center justify-center text-zinc-400">
                <Minus />
              </button>
              <button onClick={() => setCredits(c => c + 1)} className="bg-white text-black px-8 rounded-2xl font-bold flex items-center gap-2">
                <Clock size={18} /> +1 Sessione
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="p-6 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold mb-6">Negozio Premi</h2>
          
          <div className="glass p-5 rounded-3xl mb-8 space-y-3">
            <input type="text" placeholder="Nome premio..." value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none" />
            <div className="flex gap-2">
              <input type="number" placeholder="Costo" value={cost} onChange={e => setCost(e.target.value)} className="w-24 bg-white/5 border border-white/10 p-3 rounded-xl outline-none" />
              <label className="flex-1 glass flex items-center justify-center rounded-xl cursor-pointer text-zinc-400 text-sm">
                <Camera size={18} className="mr-2"/> {image ? 'Caricata' : 'Foto'}
                <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
              </label>
              <button onClick={addReward} className="bg-white text-black px-5 rounded-xl font-bold"><Plus /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {rewards.map(reward => (
              <div key={reward.id} className="glass p-3 rounded-[2rem] flex flex-col gap-3">
                <div className="aspect-square rounded-2xl bg-zinc-900 overflow-hidden relative border border-white/5">
                  {reward.image ? (
                    <img src={reward.image} className="w-full h-full object-cover" />
                  ) : (
                    <Gift className="absolute inset-0 m-auto text-zinc-800" size={40} />
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-amber-500 text-[10px] font-bold">
                    {reward.cost} CR
                  </div>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs truncate text-zinc-300 w-2/3">{reward.name}</span>
                  <button onClick={() => deleteReward(reward.id)} className="text-zinc-700 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/5 flex justify-around items-center max-w-md mx-auto z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-white' : 'text-zinc-600'}`}>
          <Home /><span className="text-[9px] mt-1 uppercase font-bold">Home</span>
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center ${activeTab === 'shop' ? 'text-white' : 'text-zinc-600'}`}>
          <ShoppingBag /><span className="text-[9px] mt-1 uppercase font-bold">Premi</span>
        </button>
      </nav>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
