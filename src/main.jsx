import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  GraduationCap, 
  ChevronLeft, 
  ShoppingBag,
  Clock,
  Home,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Gift,
  Pin
} from 'lucide-react';

// --- CONFIGURAZIONE GOOGLE API ---
const CLIENT_ID = "265799114700-n3h704aad8emr3929h7qle9hc1mihbg7.apps.googleusercontent.com"; 
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

const FIXED_SUBJECTS = [
  { id: 'it-o', name: 'Italiano Orale' }, { id: 'it-s', name: 'Italiano Scritto' },
  { id: 'lat-o', name: 'Latino Orale' }, { id: 'lat-s', name: 'Latino Scritto' },
  { id: 'gre-o', name: 'Greco Orale' }, { id: 'gre-s', name: 'Greco Scritto' },
  { id: 'mat', name: 'Matematica' }, { id: 'ing', name: 'Inglese' },
  { id: 'geo', name: 'Geostoria' }, { id: 'civ', name: 'Ed. Civica' },
  { id: 'fis', name: 'Ed. Fisica' }, { id: 'sci', name: 'Scienze Naturali' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [credits, setCredits] = useState(() => Number(localStorage.getItem('f_credits')) || 0);
  const [grades, setGrades] = useState(() => JSON.parse(localStorage.getItem('f_grades')) || []);
  const [rewards, setRewards] = useState(() => JSON.parse(localStorage.getItem('f_rewards')) || []);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);

  // Persistenza Dati
  useEffect(() => {
    localStorage.setItem('f_credits', credits);
    localStorage.setItem('f_grades', JSON.stringify(grades));
    localStorage.setItem('f_rewards', JSON.stringify(rewards));
  }, [credits, grades, rewards]);

  // Inizializzazione Google GIS
  useEffect(() => {
    const initGis = () => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (resp) => {
            if (resp.access_token) {
              setIsAuthenticated(true);
              fetchEvents(resp.access_token);
            }
          },
        });
        setTokenClient(client);
      } catch (err) {
        console.warn("Google GIS non ancora pronto o bloccato.");
      }
    };

    if (window.google) {
      initGis();
    } else {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = initGis;
      document.body.appendChild(script);
    }
  }, []);

  const fetchEvents = async (token) => {
    try {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date().toISOString()}&maxResults=5&orderBy=startTime&singleEvents=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCalendarEvents(data.items || []);
    } catch (e) { console.error("Errore fetch eventi:", e); }
  };

  const calculateAverage = (id) => {
    const subGrades = grades.filter(g => g.subjectId === id);
    return subGrades.length ? (subGrades.reduce((a, b) => a + parseFloat(b.value), 0) / subGrades.length).toFixed(2) : "0.00";
  };

  const calculateTotalAverage = () => {
    const averages = FIXED_SUBJECTS.map(s => parseFloat(calculateAverage(s.id))).filter(a => a > 0);
    return averages.length ? (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2) : "0.00";
  };

  const addGrade = (val) => {
    if (!selectedSubjectId) return;
    const newGrade = { id: Date.now(), subjectId: selectedSubjectId, value: val };
    setGrades([...grades, newGrade]);
    // Logica crediti bonus per i voti alti
    if (val >= 8) setCredits(c => c + 1.5);
    if (val >= 9) setCredits(c => c + 1.5); // cumulativo
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 max-w-md mx-auto overflow-x-hidden">
      <style>{`
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .white-logo { filter: brightness(0) invert(1); }
        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* DASHBOARD */}
      {activeTab === 'home' && (
        <div className="p-6 pt-12 animate-fade">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-bold">Foundation</h1>
              <p className="text-amber-500 font-bold text-sm">No pain, no gain</p>
            </div>
            <img src="https://files.oaiusercontent.com/file-X9pXFpX9pXFpX9pXFpX9pXFp" className="w-12 h-12 white-logo opacity-80" alt="Logo" />
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="glass rounded-[2rem] p-4 w-32 h-32 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{calculateTotalAverage()}</span>
              <span className="text-zinc-500 text-[8px] uppercase font-bold tracking-widest">Media</span>
            </div>
            <div className="glass rounded-[2rem] flex-1 p-6">
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Crediti</p>
              <h2 className="text-4xl font-bold text-amber-500">{credits.toFixed(1)}</h2>
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] flex flex-col items-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4 font-bold">Session Tracker</p>
            <div className="flex items-center justify-between w-full">
               <button onClick={() => setCredits(c => Math.max(0, c - 1))} className="glass w-12 h-12 rounded-2xl flex items-center justify-center text-zinc-500">
                <Plus className="rotate-45" size={20} />
              </button>
              <button onClick={() => setCredits(c => c + 1)} className="bg-white text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-transform">
                <Clock size={18} />
                <span>+1 Sessione</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDARIO */}
      {activeTab === 'calendar' && (
        <div className="p-6 pt-12 animate-fade">
          <h2 className="text-2xl font-bold mb-6">Calendario</h2>
          {!isAuthenticated ? (
            <div className="glass p-8 rounded-[2rem] text-center">
              <CalendarIcon className="mx-auto mb-4 text-zinc-700" size={48} />
              <p className="text-zinc-400 text-sm mb-6">Collega il tuo account per vedere i prossimi impegni scolastici.</p>
              <button 
                onClick={() => tokenClient?.requestAccessToken()}
                className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                Connetti Google
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {calendarEvents.length > 0 ? calendarEvents.map(ev => (
                <div key={ev.id} className="glass p-4 rounded-2xl border-l-2 border-amber-500">
                  <p className="font-bold text-sm truncate">{ev.summary}</p>
                  <p className="text-zinc-500 text-[10px] mt-1">{new Date(ev.start.dateTime || ev.start.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                </div>
              )) : <p className="text-zinc-500 text-center py-10">Nessun evento in programma.</p>}
            </div>
          )}
        </div>
      )}

      {/* VOTI */}
      {activeTab === 'subjects' && (
        <div className="p-6 pt-12 animate-fade">
           {!selectedSubjectId ? (
             <>
               <h2 className="text-2xl font-bold mb-6">Materie</h2>
               <div className="grid grid-cols-3 gap-3">
                 {FIXED_SUBJECTS.map(sub => (
                   <button key={sub.id} onClick={() => setSelectedSubjectId(sub.id)} className="glass p-4 rounded-2xl text-center active:scale-95 transition-transform">
                     <p className="text-amber-500 text-xs font-bold">{calculateAverage(sub.id)}</p>
                     <p className="text-[8px] text-zinc-400 uppercase mt-2 leading-tight">{sub.name}</p>
                   </button>
                 ))}
               </div>
             </>
           ) : (
             <div>
               <button onClick={() => setSelectedSubjectId(null)} className="flex items-center text-zinc-500 mb-6 text-sm"><ChevronLeft size={16} /> Indietro</button>
               <h2 className="text-2xl font-bold mb-6">{FIXED_SUBJECTS.find(s => s.id === selectedSubjectId)?.name}</h2>
               
               <div className="glass p-5 rounded-3xl mb-6">
                 <p className="text-[10px] uppercase text-zinc-500 font-bold mb-3">Nuovo Voto</p>
                 <div className="grid grid-cols-4 gap-2">
                   {[6, 7, 8, 9].map(v => (
                     <button key={v} onClick={() => addGrade(v)} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl font-bold transition-colors">{v}</button>
                   ))}
                 </div>
               </div>

               <div className="space-y-3">
                 {grades.filter(g => g.subjectId === selectedSubjectId).sort((a,b) => b.id - a.id).map(grade => (
                   <div key={grade.id} className="glass p-4 rounded-2xl flex justify-between items-center">
                     <span className="text-xl font-bold text-emerald-400">{grade.value}</span>
                     <button onClick={() => setGrades(grades.filter(x => x.id !== grade.id))} className="text-zinc-800"><Trash2 size={16}/></button>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}

      {/* NAV BAR */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass flex justify-around items-center max-w-md mx-auto z-50">
        <button onClick={() => {setActiveTab('home'); setSelectedSubjectId(null);}} className={activeTab === 'home' ? 'text-amber-500' : 'text-zinc-500'}>
          <Home size={22} /><p className="text-[8px] font-bold mt-1">DASH</p>
        </button>
        <button onClick={() => setActiveTab('subjects')} className={activeTab === 'subjects' ? 'text-amber-500' : 'text-zinc-500'}>
          <GraduationCap size={22} /><p className="text-[8px] font-bold mt-1">VOTI</p>
        </button>
        <button onClick={() => setActiveTab('calendar')} className={activeTab === 'calendar' ? 'text-amber-500' : 'text-zinc-500'}>
          <CalendarIcon size={22} /><p className="text-[8px] font-bold mt-1">CAL</p>
        </button>
        <button onClick={() => setActiveTab('shop')} className={activeTab === 'shop' ? 'text-amber-500' : 'text-zinc-500'}>
          <ShoppingBag size={22} /><p className="text-[8px] font-bold mt-1">SHOP</p>
        </button>
      </nav>
    </div>
  );
};

// Avvio sicuro dell'app
const mountApp = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
};

if (document.readyState === 'complete') mountApp();
else window.addEventListener('load', mountApp);
