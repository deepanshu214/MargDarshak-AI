
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  User, LogOut, Bell, Menu as MenuIcon, X, 
  Medal, Languages, Trophy, Zap, ShieldCheck, FileUser, ChevronDown, 
  Search, Settings, BookOpen, Wallet, GraduationCap, Users, Sparkles, 
  ChevronRight, HelpCircle, LayoutDashboard, Star, MessageSquare,
  Clock, CheckCircle2, Info, Trash2, History, Flame, Award
} from 'lucide-react';
import Home from './views/Home';
import Dashboard from './views/Dashboard';
import MockTest from './views/MockTest';
import Chatbot from './views/Chatbot';
import Profile from './views/Profile';
import Login from './views/Login';
import Leaderboard from './views/Leaderboard';
import ResumeBuilder from './views/ResumeBuilder';
import { UserProfile } from './types';
import { UI_STRINGS, LANGUAGES, SAMPLE_SCHEMES } from './constants';
import { databaseService } from './services/databaseService';

const NAV_CATEGORIES = [
  {
    titleId: "learning",
    icon: <BookOpen className="w-4 h-4" />,
    items: [
      { id: 'home', name: 'home', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'test', name: 'test', href: '/test', icon: <Trophy className="w-4 h-4" /> },
    ]
  },
  {
    titleId: "support",
    icon: <Wallet className="w-4 h-4" />,
    items: [
      { id: 'schemes', name: 'schemes', href: '/schemes', icon: <Wallet className="w-4 h-4" /> },
      { id: 'guidance', name: 'guidance', href: '/chatbot', icon: <Users className="w-4 h-4" /> },
    ]
  },
  {
    titleId: "career",
    icon: <GraduationCap className="w-4 h-4" />,
    items: [
      { id: 'resume', name: 'resume', href: '/resume', icon: <FileUser className="w-4 h-4" /> },
      { id: 'leaderboard', name: 'leaderboard', href: '/leaderboard', icon: <Medal className="w-4 h-4" /> },
      { id: 'profile', name: 'profile', href: '/profile', icon: <GraduationCap className="w-4 h-4" /> },
    ]
  }
];

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'scheme' | 'achievement' | 'system';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<string[]>(['learning', 'support', 'career']);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeEmail = localStorage.getItem('margdarshak_active_session');
    if (activeEmail) {
      const dbUser = databaseService.loginUser(activeEmail);
      if (dbUser) {
        setUser(dbUser);
        const initialNotifications: Notification[] = [
          {
            id: '1',
            title: 'Scholarship Application Window Open',
            message: 'Central Sector & Post-Matric schemes are currently accepting state verifications.',
            type: 'scheme',
            timestamp: new Date().toISOString(),
            isRead: false,
            link: '/schemes'
          },
          {
            id: '2',
            title: 'Daily Study Sprint Active',
            message: 'Complete today\'s 25-minute Pomodoro sprint to earn +75 Scholar XP.',
            type: 'achievement',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: false,
            link: '/'
          }
        ];
        setNotifications(initialNotifications);
      }
    }
    setLoading(false);

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = databaseService.updateUser(user.email, updates);
    if (updatedUser) setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('margdarshak_active_session');
    setUser(null);
  };

  const toggleCat = (titleId: string) => {
    setExpandedCats(prev => 
      prev.includes(titleId) ? prev.filter(c => c !== titleId) : [...prev, titleId]
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  const strings = UI_STRINGS[user?.language || 'en'] || UI_STRINGS['en'];
  const isRTL = user?.language === 'ur';
  const currentLevel = Math.floor(((user?.points || 0) / 200)) + 1;
  const levelProgress = ((user?.points || 0) % 200) / 200 * 100;

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#072117] overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce mb-8 border-2 border-amber-300/40">
          <GraduationCap className="w-10 h-10 text-emerald-950" />
        </div>
        <p className="text-amber-300 font-black tracking-[0.3em] uppercase animate-pulse font-serif text-sm">MargDarshak AI</p>
        <span className="text-emerald-400/70 text-[10px] uppercase font-mono tracking-widest mt-2">Opening Scholar Library...</span>
      </div>
    </div>
  );

  return (
    <HashRouter>
      {!user ? (
        <Login onLogin={(u) => {
          localStorage.setItem('margdarshak_active_session', u.email);
          setUser(u);
        }} />
      ) : (
        <div className={`min-h-screen study-desk-bg flex font-sans text-slate-900 ${isRTL ? 'flex-row-reverse text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
          {/* ACADEMIC SCHOLAR SIDEBAR */}
          <aside className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-72 bg-[#082218] border-${isRTL ? 'l' : 'r'} border-emerald-900/60 transform transition-all duration-500 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : (isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')} flex flex-col`}>
            
            {/* Scholar Crest Branding */}
            <div className="p-6 border-b border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-emerald-950 font-black font-serif shadow-lg shadow-amber-500/20 border border-amber-300/50">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-black text-lg tracking-tight text-white font-serif">MargDarshak</h1>
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-400 block font-mono">Academic Portal</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-emerald-400/80 hover:bg-emerald-900/60 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            {/* Navigation Categories */}
            <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
              {NAV_CATEGORIES.map((cat, idx) => {
                const isExpanded = expandedCats.includes(cat.titleId);
                const titleTranslated = strings[cat.titleId] || cat.titleId.toUpperCase();
                return (
                  <div key={idx} className="space-y-1">
                    <button 
                      onClick={() => toggleCat(cat.titleId)} 
                      className="w-full px-3 py-2.5 flex items-center justify-between rounded-xl hover:bg-emerald-900/40 text-emerald-300/70 hover:text-amber-200 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-900/60 text-emerald-400'}`}>{cat.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">{titleTranslated}</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amber-300' : 'text-emerald-600'}`} />
                    </button>
                    <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                      {cat.items.map((item) => (
                        <SidebarItem key={item.href} {...item} strings={strings} isRTL={isRTL} onClick={() => setIsSidebarOpen(false)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scholar Growth & Standing Card */}
            <div className="p-4 border-t border-emerald-900/60 bg-[#051711]">
               <div className="bg-emerald-950/90 rounded-2xl p-4 border border-emerald-800/80 mb-4 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" /> Level {currentLevel} Scholar
                    </span>
                    <span className="text-[10px] font-black text-amber-300">{user.points || 0} XP</span>
                  </div>
                  <div className="h-1.5 w-full bg-emerald-900/80 rounded-full overflow-hidden mb-2.5">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${levelProgress}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-bold text-emerald-300/80">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Flame className="w-3 h-3 fill-amber-400" /> 5-Day Streak
                    </span>
                    <span>{Math.round(levelProgress)}% to Lvl {currentLevel + 1}</span>
                  </div>
               </div>

               <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-800 flex items-center justify-center text-amber-300 shadow-sm"><Languages className="w-3.5 h-3.5" /></div>
                    <span className="text-[10px] font-black uppercase text-emerald-200/80">{LANGUAGES.find(l => l.code === user.language)?.name.split(' ')[0]}</span>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    title="Sign Out"
                    className="p-2 text-emerald-400/80 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </aside>

          {/* MAIN DESK & TOP HEADER */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Top Study Header */}
            <header className="h-20 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-[#ebdccb] flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
               <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-emerald-900 hover:bg-emerald-50 rounded-lg"><MenuIcon className="w-6 h-6" /></button>
                  <div className="hidden md:flex items-center gap-3 bg-[#f3ede3]/70 px-4 py-2.5 rounded-2xl w-full max-w-md group border border-[#e2d6c3] focus-within:border-emerald-700/50 focus-within:bg-white transition-all">
                    <Search className={`w-4 h-4 text-stone-400 ${isRTL ? 'order-last' : ''}`} />
                    <input 
                      type="text" 
                      placeholder="Search mock tests, scholarships, study guides..." 
                      className="bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-slate-800 placeholder:text-stone-400 w-full" 
                    />
                  </div>
               </div>

               {/* Right Header Badges & Actions */}
               <div className="flex items-center gap-3 sm:gap-4">
                  
                  {/* Active Streak Badge */}
                  <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-full text-xs font-black shadow-xs">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                    <span>5-Day Streak</span>
                  </div>

                  {/* Scholar XP Pill */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600/10 border border-emerald-600/20 text-emerald-900 rounded-full text-xs font-black shadow-xs">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <span>Lvl {currentLevel} • {user.points || 0} XP</span>
                  </div>

                  {/* Language Switcher */}
                  <div className="relative" ref={langMenuRef}>
                    <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="p-2.5 text-stone-600 hover:bg-[#f0e8dc] rounded-xl flex items-center gap-2 transition-all border border-stone-200">
                      <Languages className="w-4 h-4 text-emerald-800" />
                      <span className="text-[10px] font-black uppercase hidden sm:block">{user.language}</span>
                    </button>
                    {isLangMenuOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              updateProfile({ language: lang.code });
                              setIsLangMenuOpen(false);
                            }}
                            className={`w-full text-left px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${user.language === lang.code ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-slate-700 hover:bg-stone-50'}`}
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationMenuRef}>
                    <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative p-2.5 text-stone-600 hover:bg-[#f0e8dc] rounded-xl transition-all border border-stone-200">
                      <Bell className="w-4 h-4 text-emerald-800" />
                      {notifications.some(n => !n.isRead) && <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-white animate-pulse"></span>}
                    </button>
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-3 w-84 bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
                           <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                             <Bell className="w-3.5 h-3.5 text-amber-600" /> Notifications & Alerts
                           </h3>
                           <button onClick={clearNotifications} className="text-[10px] font-black text-emerald-700 uppercase hover:underline">Clear All</button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                           {notifications.length > 0 ? (
                             notifications.map((n) => (
                               <div key={n.id} onClick={() => markNotificationAsRead(n.id)} className={`p-4 hover:bg-stone-50 transition-all border-b border-stone-100 last:border-0 relative cursor-pointer ${!n.isRead ? 'bg-emerald-50/40' : ''}`}>
                                  {!n.isRead && <div className="absolute top-5 left-2 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>}
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-xs text-slate-800 pr-2">{n.title}</h4>
                                    <span className="text-[8px] font-bold text-stone-400 uppercase">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{n.message}</p>
                                  {n.link && (
                                    <Link to={n.link} className="inline-block mt-2 text-[9px] font-black text-emerald-700 uppercase hover:underline" onClick={() => setIsNotificationOpen(false)}>Open Section →</Link>
                                  )}
                               </div>
                             ))
                           ) : (
                             <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                <Bell className="w-7 h-7 mb-2 opacity-30 text-stone-400" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No new alerts</p>
                             </div>
                           )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Menu */}
                  <div className="relative" ref={profileMenuRef}>
                    <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 pl-3.5 pr-3 py-1.5 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500/50 shadow-xs group">
                      <div className="flex flex-col text-right hidden sm:flex">
                        <span className="text-xs font-black text-slate-800 leading-none mb-1">{user.name.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">{user.points} XP</span>
                      </div>
                      {user.avatar ? (
                        <div className="relative">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-xl object-cover border border-emerald-300 ring-2 ring-emerald-50" />
                          {user.authProvider === 'google' && (
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-xs border border-stone-200" title="Google Verified">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-emerald-100 rounded-xl border border-emerald-200 flex items-center justify-center text-emerald-800">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 text-slate-700 font-bold text-xs">
                          <User className="w-4 h-4 text-emerald-700" /> Scholar Profile
                        </Link>
                        <Link to="/leaderboard" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 text-slate-700 font-bold text-xs">
                          <Medal className="w-4 h-4 text-amber-500" /> Honor Roll & Ranks
                        </Link>
                        <div className="border-t border-stone-100 my-1"></div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-red-50 text-red-600 font-bold text-xs text-left">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
               </div>
            </header>

            {/* Content Desk */}
            <main className="flex-1 overflow-y-auto study-desk-bg scroll-smooth p-0">
              <Routes>
                <Route path="/" element={<Home user={user} strings={strings} />} />
                <Route path="/schemes" element={<Dashboard user={user} updateProfile={updateProfile} strings={strings} />} />
                <Route path="/test" element={<MockTest user={user} updateProfile={updateProfile} strings={strings} />} />
                <Route path="/resume" element={<ResumeBuilder user={user} updateProfile={updateProfile} strings={strings} />} />
                <Route path="/chatbot" element={<Chatbot user={user} updateProfile={updateProfile} />} />
                <Route path="/leaderboard" element={<Leaderboard user={user} strings={strings} />} />
                <Route path="/profile" element={<Profile user={user} setUser={setUser} updateProfile={updateProfile} strings={strings} />} />
              </Routes>
              
              {/* Floating Scholar AI Guidance Desk */}
              <Link to="/chatbot" className={`fixed bottom-8 ${isRTL ? 'left-8' : 'right-8'} group z-30`} title="Ask MargDarshak AI">
                <div className="relative w-15 h-15 bg-gradient-to-br from-emerald-800 to-[#072117] rounded-2xl shadow-xl border-2 border-amber-400/60 flex items-center justify-center text-amber-300 hover:scale-110 hover:-rotate-3 transition-all">
                  <MessageSquare className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                  </span>
                </div>
              </Link>
            </main>
          </div>
        </div>
      )}
    </HashRouter>
  );
};

const SidebarItem: React.FC<{ id: string; name: string; href: string; icon: React.ReactNode; strings: any; isRTL: boolean; onClick?: () => void }> = ({ id, name, href, icon, strings, isRTL, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  const translatedName = strings[name] || name;
  return (
    <Link 
      to={href} 
      onClick={onClick} 
      className={`group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
        isRTL ? 'mr-3 ml-2 flex-row-reverse' : 'ml-3 mr-2'
      } ${
        isActive 
          ? 'bg-emerald-800/90 text-amber-300 font-bold border border-amber-400/30 shadow-md' 
          : 'text-emerald-100/70 hover:bg-emerald-900/50 hover:text-white font-medium'
      }`}
    >
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isActive ? 'text-amber-300' : 'text-emerald-300/60 group-hover:text-amber-300'}>{icon}</div>
        <span className="text-[11px] uppercase tracking-wider">{translatedName}</span>
      </div>
      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-300"></div>}
    </Link>
  );
};

export default App;
