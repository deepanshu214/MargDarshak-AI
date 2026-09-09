
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck, Info, Languages, ChevronDown, UserPlus, LogIn } from 'lucide-react';
import { LANGUAGES, UI_STRINGS } from '../constants';
import { databaseService } from '../services/databaseService';

const Login: React.FC<{ onLogin: (user: UserProfile) => void }> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const strings = UI_STRINGS[selectedLang] || UI_STRINGS['en'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Check if logging in
    if (!isSignup) {
      const existingUser = databaseService.loginUser(email);
      if (!existingUser) {
        alert("Account not found. Please sign up first!");
        return;
      }
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(newCode);
    setShowVerification(true);
  };

  useEffect(() => {
    if (showVerification && simulatedCode) {
      alert(`[DEMO ONLY] Verification Code sent to ${email}: ${simulatedCode}`);
    }
  }, [showVerification, simulatedCode]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === simulatedCode || code === '123456') {
      if (isSignup) {
        const newUser: UserProfile = {
          name: name || email.split('@')[0],
          email: email,
          points: 50,
          badges: ['New Explorer'],
          language: selectedLang,
          isVerified: true,
          testHistory: [],
          answeredQuestionIds: []
        };
        const success = databaseService.registerUser(newUser);
        if (success) {
          onLogin(newUser);
        } else {
          alert("Email already registered. Please login.");
          setIsSignup(false);
          setShowVerification(false);
        }
      } else {
        const user = databaseService.loginUser(email);
        if (user) {
          databaseService.updateUser(email, { language: selectedLang });
          onLogin({ ...user, language: selectedLang });
        }
      }
    } else {
      alert("Invalid verification code. Use 123456 to bypass.");
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen study-desk-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-12 right-12 w-96 h-96 bg-emerald-700/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-12 left-12 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-10 text-center relative overflow-hidden border border-stone-200/80 z-10">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-500"></div>
          
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-200/80 rounded-3xl flex items-center justify-center text-emerald-800 mx-auto mb-6 shadow-sm">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 mb-2 font-serif">{strings.verifyEmail}</h2>
          <p className="text-stone-500 text-xs sm:text-sm font-medium mb-8 leading-relaxed">
            {strings.enterCode} <span className="font-bold text-emerald-800">{email}</span>
          </p>
          
          <div className="bg-amber-50/80 border border-amber-200/90 p-4 rounded-2xl mb-6 flex items-start gap-3 text-left">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              Demo Hint: Use the code from the browser alert or <span className="font-black">123456</span>.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="0 0 0 0 0 0"
              className="w-full text-center text-4xl tracking-[0.4em] font-mono font-black py-5 bg-stone-50 border-2 border-stone-200 rounded-2xl focus:border-emerald-800 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
            />
            <button 
              type="submit"
              className="w-full py-4.5 bg-emerald-800 text-amber-200 font-black rounded-2xl shadow-xl shadow-emerald-950/20 hover:bg-emerald-900 border border-amber-400/30 transition-all active:scale-95"
            >
              {strings.verify}
            </button>
          </form>
          <button 
            onClick={() => setShowVerification(false)} 
            className="mt-8 text-xs font-bold text-stone-400 hover:text-emerald-800 transition-colors uppercase tracking-widest"
          >
            ← Back to Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen study-desk-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Scholar Study Lighting */}
      <div className="absolute top-12 right-12 w-96 h-96 bg-emerald-700/12 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-12 left-12 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider hover:bg-white transition-all"
          >
            <Languages className="w-4 h-4 text-emerald-800" />
            {LANGUAGES.find(l => l.code === selectedLang)?.name || 'Language'}
            <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 animate-in fade-in slide-in-from-top-2 z-50">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${selectedLang === lang.code ? 'bg-emerald-50 text-emerald-800 font-black' : 'text-stone-700 hover:bg-stone-50'}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-200/80 relative z-10">
        <div className="h-2.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-500"></div>
        
        <div className="p-8 sm:p-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#082218] to-[#041a12] rounded-2xl flex items-center justify-center text-amber-300 shadow-xl border border-amber-400/30 ring-4 ring-emerald-900/10">
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-800 mb-1.5 font-serif">
              {isSignup ? strings.signup : strings.login}
            </h1>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest font-mono">
              MargDarshak AI • Scholar Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 font-mono">{strings.fullName}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4.5 h-4.5" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-12 pr-4 py-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-bold text-xs sm:text-sm text-slate-800"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 font-mono">{strings.emailAddr}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4.5 h-4.5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@domain.edu"
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-bold text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 font-mono">{strings.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4.5 h-4.5" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-bold text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-emerald-800 text-amber-200 font-black rounded-2xl shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 hover:bg-emerald-900 border border-amber-400/30 transition-all active:scale-95 text-sm uppercase tracking-wider"
            >
              {isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isSignup ? strings.signup : strings.login}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 text-center">
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="text-emerald-800 font-black text-xs hover:underline uppercase tracking-wider"
            >
              {isSignup ? "Already registered? Scholar Sign In →" : "New student? Create Scholar Account →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
