
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  User, LogOut, Bell, Menu as MenuIcon, X, 
  Medal, Languages, Trophy, Zap, ShieldCheck, FileUser, ChevronDown, 
  Search, Settings, BookOpen, Wallet, GraduationCap, Users, Sparkles, 
  ChevronRight, HelpCircle, LayoutDashboard, Star, MessageSquare,
  Clock, CheckCircle2, Info, Trash2, History
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
    icon: <HelpCircle className="w-4 h-4" />,
    items: [
      { id: 'schemes', name: 'schemes', href: '/schemes', icon: <Wallet className="w-4 h-4" /> },
      { id: 'guidance', name: 'guidance', href: '/chatbot', icon: <Users className="w-4 h-4" /> },
    ]
  },
  {
    titleId: "career",
    icon: <Star className="w-4 h-4" />,
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
            title: 'New Scholarship Alert!',
            message: `Scholarships for students are now accepting applications.`,
            type: 'scheme',
            timestamp: new Date().toISOString(),
            isRead: false,
            link: '/schemes'
          },
          {
            id: '2',
            title: 'System Update',
            message: 'Now supports 9 Indian languages.',
            type: 'system',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: false
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

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-indigo-900 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce mb-8">
          <Zap className="w-10 h-10 text-indigo-600" />
        </div>
        <p className="text-indigo-200 font-black tracking-[0.3em] uppercase animate-pulse">MargDarshak AI</p>
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
        <div className={`min-h-screen bg-[#f8fafc] flex font-sans text-slate-900 ${isRTL ? 'flex-row-reverse text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <aside className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-72 bg-white border-${isRTL ? 'l' : 'r'} border-slate-200/60 transform transition-all duration-500 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : (isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')} flex flex-col`}>
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg">M</div>
                <h1 className="font-black text-xl tracking-tighter text-slate-800">MargDarshak</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 px-4 py-2 space-y-4 overflow-y-auto custom-scrollbar">
              {NAV_CATEGORIES.map((cat, idx) => {
                const isExpanded = expandedCats.includes(cat.titleId);
                const titleTranslated = strings[cat.titleId] || cat.titleId.toUpperCase();
                return (
                  <div key={idx} className="space-y-1">
                    <button onClick={() => toggleCat(cat.titleId)} className="w-full px-4 py-3 flex items-center justify-between rounded-xl hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{cat.icon}</div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{titleTranslated}</span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`space-y-1 overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                      {cat.items.map((item) => (
                        <SidebarItem key={item.href} {...item} strings={strings} isRTL={isRTL} onClick={() => setIsSidebarOpen(false)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
               <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{strings.level || 'Growth'}</span>
                    <span className="text-[10px] font-black text-indigo-600">{user.points} XP</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(user.points % 200) / 200 * 100}%` }}></div>
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm"><Languages className="w-4 h-4" /></div>
                    <span className="text-[10px] font-black uppercase text-slate-500">{LANGUAGES.find(l => l.code === user.language)?.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><LogOut className="w-4 h-4" /></button>
               </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
               <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><MenuIcon className="w-6 h-6" /></button>
                  <div className="hidden md:flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl w-full max-w-md group border border-slate-100">
                    <Search className={`w-4 h-4 text-slate-400 ${isRTL ? 'order-last' : ''}`} />
                    <input type="text" placeholder="..." className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-full" />
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  {/* Language Switcher */}
                  <div className="relative" ref={langMenuRef}>
                    <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-all">
                      <Languages className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase hidden sm:block">{user.language}</span>
                    </button>
                    {isLangMenuOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              updateProfile({ language: lang.code });
                              setIsLangMenuOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${user.language === lang.code ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationMenuRef}>
                    <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                      <Bell className="w-5 h-5" />
                      {notifications.some(n => !n.isRead) && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                    </button>
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                           <h3 className="font-black text-slate-800 text-sm">Notifications</h3>
                           <button onClick={clearNotifications} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Clear All</button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                           {notifications.length > 0 ? (
                             notifications.map((n) => (
                               <div key={n.id} onClick={() => markNotificationAsRead(n.id)} className={`p-5 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 relative cursor-pointer ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                                  {!n.isRead && <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-xs text-slate-800 pr-2">{n.title}</h4>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                                  {n.link && (
                                    <Link to={n.link} className="inline-block mt-2 text-[9px] font-black text-indigo-600 uppercase hover:underline" onClick={() => setIsNotificationOpen(false)}>View Details</Link>
                                  )}
                               </div>
                             ))
                           ) : (
                             <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                                <Bell className="w-8 h-8 mb-3 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No new notifications</p>
                             </div>
                           )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Menu */}
                  <div className="relative" ref={profileMenuRef}>
                    <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 pl-4 pr-3 py-1.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 shadow-sm group">
                      <div className="flex flex-col text-right hidden sm:flex">
                        <span className="text-xs font-black text-slate-800 leading-none mb-1">{user.name.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{user.points} XP</span>
                      </div>
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <User className="w-5 h-5" />
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm">
                          <User className="w-4 h-4 text-indigo-600" /> My Profile
                        </Link>
                        <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-700 font-bold text-sm">
                          <History className="w-4 h-4 text-indigo-600" /> Activity History
                        </Link>
                        <div className="border-t border-slate-50 my-2"></div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600 font-bold text-sm text-left">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
               </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-[#f8fafc] scroll-smooth p-0">
              <Routes>
                <Route path="/" element={<Home user={user} strings={strings} />} />
                <Route path="/schemes" element={<Dashboard user={user} updateProfile={updateProfile} strings={strings} />} />
                <Route path="/test" element={<MockTest user={user} updateProfile={updateProfile} strings={strings} />} />
                <Route path="/resume" element={<ResumeBuilder user={user} updateProfile={updateProfile} strings={strings} />} />
                <Route path="/chatbot" element={<Chatbot user={user} updateProfile={updateProfile} />} />
                <Route path="/leaderboard" element={<Leaderboard user={user} strings={strings} />} />
                <Route path="/profile" element={<Profile user={user} setUser={setUser} updateProfile={updateProfile} strings={strings} />} />
              </Routes>
              <Link to="/chatbot" className={`fixed bottom-10 ${isRTL ? 'left-10' : 'right-10'} group z-30`}>
                <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[1.8rem] shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all">
                  <MessageSquare className="w-7 h-7" />
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
    <Link to={href} onClick={onClick} className={`group flex items-center justify-between px-6 py-3.5 rounded-xl transition-all duration-300 ${isRTL ? 'mr-4 ml-2 flex-row-reverse' : 'ml-4 mr-2'} ${isActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}>{icon}</div>
        <span className="text-[11px] font-black uppercase tracking-[0.15em]">{translatedName}</span>
      </div>
      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-lg"></div>}
    </Link>
  );
};

export default App;
