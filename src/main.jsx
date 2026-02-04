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
  Image as ImageIcon,
  Calendar as CalendarIcon,
  ExternalLink,
  LogOut
} from 'lucide-react';

// --- CONFIGURAZIONE GOOGLE API ---
const CLIENT_ID = "265799114700-n3h704aad8emr3929h7qle9hc1mihbg7.apps.googleusercontent.com"; 
const API_KEY = ""; 
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

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
  
  // Google Calendar State
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    localStorage.setItem('f_credits', credits);
    localStorage.setItem('f_rewards', JSON.stringify(rewards));
    localStorage.setItem('f_grades', JSON.stringify(grades));
    localStorage.setItem('f_pinnedId', pinnedRewardId || '');
  }, [credits, rewards, grades, pinnedRewardId]);

  // --- GOOGLE CALENDAR LOGIC ---
  useEffect(() => {
    const loadScripts = () => {
      const gapiScript = document.createElement('script');
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.async = true;
      gapiScript.defer = true;
      gapiScript.onload = () => {
        gapi.load('client', async () => {
          await gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] });
          setGapiInited(true);
        });
      };
      document.body.appendChild(gapiScript);

      const gisScript = document.createElement('script');
      gisScript.src = "https://accounts.google.com/gsi/client";
      gisScript.async = true;
      gisScript.defer = true;
      gisScript.onload = () => {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (resp) => {
            if (resp.error) return;
            setIsAuthenticated(true);
            listUpcomingEvents();
          },
        });
        setTokenClient(client);
        setGisInited(true);
      };
      document.body.appendChild(gisScript);
    };
    loadScripts();
  }, []);

  const handleAuthClick = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  };

  const handleSignoutClick = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
      setCalendarEvents([]);
      setIsAuthenticated(false);
    }
  };

  const listUpcomingEvents = async () => {
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      });
      setCalendarEvents(response.result.items);
    } catch (err) {
      console.error(err);
    }
  };

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

  const addGrade = (val) => {
    if (!selectedSubjectId) return;
    const earned = val >= 9 ? 5 : (val >= 8 ? 2 : 0);
    const newGrade = { id: Date.now(), subjectId: selectedSubjectId, value: val, creditsEarned: earned };
    setGrades([...grades, newGrade]);
    setCredits(prev => prev + earned);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const pinnedItem = rewards.find(r => String(r.id) === pinnedRewardId);

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 max-w-md mx-auto overflow-x-hidden">
      <style>{`
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .glass-input { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); color: white; border-radius: 16px; padding: 12px; outline: none; }
      `}</style>

      {/* --- HOME TAB --- */}
      {activeTab === 'home' && (
        <div className="p-6">
          <header className="flex justify-between items-start mb-8 pt-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Foundation</h1>
              <p className="text-amber-500 font-semibold text-sm">No pain, no gain</p>
            </div>
          </header>

          <div className="flex gap-4 mb-6">
            <div className="glass rounded-[2rem] p-4 flex-shrink-0 flex items-center justify-center w-32 h-32">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{calculateTotalAverage()}</span>
                <span className="text-[7px] uppercase tracking-widest text-zinc-500">Media</span>
              </div>
            </div>
            <div className="glass rounded-[2rem] flex-1 p-5 flex flex-col justify-center">
                <p className="text-zinc-500 text-[9px] uppercase tracking-widest">Crediti</p>
                <h2 className="text-4xl font-bold text-amber-500">{credits.toFixed(1)}</h2>
            </div>
          </div>

          {isAuthenticated && calendarEvents.length > 0 && (
            <div className="glass p-5 rounded-3xl mb-6 border-l-4 border-amber-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Prossimo Impegno</span>
                <CalendarIcon size={12} className="text-amber-500" />
              </div>
              <p className="font-bold truncate text-sm">{calendarEvents[0].summary}</p>
            </div>
          )}
        </div>
      )}

      {/* --- SUBJECTS TAB --- */}
      {activeTab === 'subjects' && (
        <div className="p-6">
           {!selectedSubjectId ? (
             <div className="grid grid-cols-3 gap-3">
               {FIXED_SUBJECTS.map(sub => (
                 <button key={sub.id} onClick={() => setSelectedSubjectId(sub.id)} className="glass p-3 rounded-[1.8rem] flex flex-col items-center gap-2 aspect-square justify-center">
                    <span className="text-xs font-bold text-emerald-400">{calculateAverage(sub.id)}</span>
                    <span className="text-[9px] text-zinc-400 font-medium">{sub.name}</span>
                 </button>
               ))}
             </div>
           ) : (
             <div>
               <button onClick={() => setSelectedSubjectId(null)} className="flex items-center text-zinc-500 mb-6 text-sm"><ChevronLeft size={18} /> Indietro</button>
               <h2 className="text-2xl font-bold mb-6">{FIXED_SUBJECTS.find(s => s.id === selectedSubjectId).name}</h2>
               <div className="glass p-5 rounded-3xl mb-4">
                  <select className="glass-input w-full" onChange={(e) => { if(e.target.value) addGrade(parseFloat(e.target.value)); e.target.value = ""; }}>
                    <option value="">Aggiungi Voto...</option>
                    {[10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
               </div>
             </div>
           )}
        </div>
      )}

      {/* --- CALENDAR TAB (QUESTA È QUELLA CHE CERCAVI!) --- */}
      {activeTab === 'calendar' && (
        <div className="p-6 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-end mb-8 pt-8">
            <div>
              <h2 className="text-3xl font-bold">Calendario</h2>
              <p className="text-zinc-500 text-sm">I tuoi impegni Google</p>
            </div>
            {!isAuthenticated ? (
              <button onClick={handleAuthClick} className="bg-white text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                <CalendarIcon size={16} /> Collega
              </button>
            ) : (
              <button onClick={handleSignoutClick} className="glass text-zinc-500 p-2 rounded-xl">
                <LogOut size={18} />
              </button>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="glass rounded-[2.5rem] p-8 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 text-zinc-700">
                <CalendarIcon size={32} />
              </div>
              <h3 className="font-bold mb-2">Non collegato</h3>
              <p className="text-zinc-500 text-xs mb-6 px-4">Collega il tuo account Google per visualizzare i compiti e le verifiche segnate sul calendario.</p>
              <button onClick={handleAuthClick} className="bg-amber-500 text-black w-full py-4 rounded-2xl font-bold active:scale-95 transition-transform">
                Accedi con Google
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button onClick={listUpcomingEvents} className="w-full py-2 text-zinc-500 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                Aggiorna <Clock size={10} />
              </button>
              {calendarEvents.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm py-10">Nessun evento imminente.</p>
              ) : (
                calendarEvents.map(event => (
                  <div key={event.id} className="glass p-4 rounded-2xl border-l-4 border-amber-500">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm truncate pr-4">{event.summary}</h4>
                      <ExternalLink size={12} className="text-zinc-700 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <Clock size={10} />
                      <span>
                        {new Date(event.start.dateTime || event.start.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' • '}
                        {new Date(event.start.dateTime || event.start.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* --- SHOP TAB --- */}
      {activeTab === 'shop' && (
        <div className="p-6">
          <div className="glass p-5 rounded-3xl mb-6 mt-8">
            <h3 className="text-lg font-bold mb-4">Nuovo Obiettivo</h3>
            <input type="text" placeholder="Cosa desideri?" value={name} onChange={e => setName(e.target.value)} className="w-full glass-input mb-3" />
            <div className="flex gap-2">
               <input type="number" placeholder="Costo" value={cost} onChange={e => setCost(e.target.value)} className="glass-input w-24" />
               <button onClick={() => { if(name && cost) { setRewards([...rewards, {id: Date.now(), name, cost: Number(cost), image}]); setName(""); setCost(""); setImage(null); }}} className="bg-white text-black px-6 rounded-2xl font-bold flex-1">+</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {rewards.map(r => (
              <div key={r.id} className="glass p-3 rounded-[2rem]">
                <p className="text-[10px] font-bold truncate">{r.name}</p>
                <p className="text-amber-500 text-[9px] font-bold">{r.cost} CR</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- BARRA DI NAVIGAZIONE (DOVE TROVI CAL) --- */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/5 flex justify-around items-center max-w-md mx-auto z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-white' : 'text-zinc-600'}`}>
          <Home size={20} /><span className="text-[9px] mt-1 font-bold">DASH</span>
        </button>
        <button onClick={() => setActiveTab('subjects')} className={`flex flex-col items-center ${activeTab === 'subjects' ? 'text-white' : 'text-zinc-600'}`}>
          <GraduationCap size={20} /><span className="text-[9px] mt-1 font-bold">VOTI</span>
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center ${activeTab === 'calendar' ? 'text-white' : 'text-zinc-600'}`}>
          <CalendarIcon size={20} /><span className="text-[9px] mt-1 font-bold">CAL</span>
        </button>
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center ${activeTab === 'shop' ? 'text-white' : 'text-zinc-600'}`}>
          <ShoppingBag size={20} /><span className="text-[9px] mt-1 font-bold">SHOP</span>
        </button>
      </nav>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
