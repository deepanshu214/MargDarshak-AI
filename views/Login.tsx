
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
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">{strings.verifyEmail}</h2>
          <p className="text-slate-500 mb-8">{strings.enterCode} <span className="font-bold text-indigo-600">{email}</span></p>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 flex items-start gap-3 text-left">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium">
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
              className="w-full text-center text-4xl tracking-[0.5em] font-black py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 outline-none transition-all"
            />
            <button 
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              {strings.verify}
            </button>
          </form>
          <button onClick={() => setShowVerification(false)} className="mt-8 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-300 blur-3xl rounded-full"></div>
         <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 blur-3xl rounded-full"></div>
      </div>

      <div className="absolute top-6 right-6 z-50">
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <Languages className="w-4 h-4 text-indigo-600" />
            {LANGUAGES.find(l => l.code === selectedLang)?.name || 'Language'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors ${selectedLang === lang.code ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 relative z-10">
        <div className="p-10 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-800 mb-2">
              {isSignup ? strings.signup : strings.login}
            </h1>
            <p className="text-slate-500 font-medium">MargDarshak AI Database Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{strings.fullName}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{strings.emailAddr}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{strings.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
            >
              {isSignup ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {isSignup ? strings.signup : strings.login}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t text-center">
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="text-indigo-600 font-bold hover:underline"
            >
              {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
