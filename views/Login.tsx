import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { 
  Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck, Info, 
  Languages, ChevronDown, UserPlus, LogIn, Clock, RefreshCw, 
  CheckCircle2, AlertCircle, KeyRound, Smartphone, X
} from 'lucide-react';
import { LANGUAGES, UI_STRINGS } from '../constants';
import { databaseService } from '../services/databaseService';
import { authService, GoogleAccount, DEMO_GOOGLE_ACCOUNTS } from '../services/authService';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const Login: React.FC<{ onLogin: (user: UserProfile) => void }> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [authChannel, setAuthChannel] = useState<'google_oauth' | 'email_password'>('google_oauth');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [selectedGoogleUser, setSelectedGoogleUser] = useState<GoogleAccount | null>(null);
  
  // Custom Google Account State
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  // Credentials State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // 6-digit OTP State
  const [showVerification, setShowVerification] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeCode, setActiveCode] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState(false);

  // Localization
  const [selectedLang, setSelectedLang] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const strings = UI_STRINGS[selectedLang] || UI_STRINGS['en'];

  // Input refs for 6 digits
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Focus first OTP input when verification opens
  useEffect(() => {
    if (showVerification && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [showVerification]);

  // Handle Google account selection
  const handleSelectGoogleAccount = (account: GoogleAccount) => {
    setSelectedGoogleUser(account);
    setAuthChannel('google_oauth');
    setShowGoogleModal(false);
    setShowCustomGoogle(false);
    setErrorMsg(null);

    // Generate real 6-digit OTP
    const { code } = authService.generateOTP(account.email, 'google_oauth', account);
    setActiveCode(code);
    setOtpDigits(['', '', '', '', '', '']);
    setTimerSeconds(60);
    setTimerActive(true);
    setShowVerification(true);
  };

  // Handle Custom Google Account Submission
  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const cleanMail = customEmail.trim().toLowerCase();
    const finalMail = cleanMail.includes('@') ? cleanMail : `${cleanMail}@gmail.com`;
    const acc: GoogleAccount = {
      id: `google_${Date.now()}`,
      name: customName.trim() || finalMail.split('@')[0],
      email: finalMail,
      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalMail)}`,
      verified: true
    };
    handleSelectGoogleAccount(acc);
  };

  // Handle Credentials submit (Email/Password)
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!isSignup) {
      const existingUser = databaseService.loginUser(email);
      if (!existingUser) {
        alert("Account not found. Please sign up or continue with Google!");
        return;
      }
    }

    setAuthChannel('email_password');
    setSelectedGoogleUser(null);
    setErrorMsg(null);

    const { code } = authService.generateOTP(email, 'email_password');
    setActiveCode(code);
    setOtpDigits(['', '', '', '', '', '']);
    setTimerSeconds(60);
    setTimerActive(true);
    setShowVerification(true);
  };

  // Handle OTP digit changes with auto-advance
  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      // User pasted multiple characters
      const pasted = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setErrorMsg(null);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation across digits
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-fill OTP button helper
  const handleAutoFillCode = () => {
    const digits = activeCode.split('');
    setOtpDigits(digits);
    inputRefs.current[5]?.focus();
  };

  // Resend OTP
  const handleResendOTP = () => {
    const targetEmail = selectedGoogleUser ? selectedGoogleUser.email : email;
    const result = authService.resendOTP(targetEmail);
    if (result) {
      setActiveCode(result.code);
      setTimerSeconds(60);
      setTimerActive(true);
      setResendNotice(true);
      setErrorMsg(null);
      setTimeout(() => setResendNotice(false), 3000);
    }
  };

  // Verify OTP and complete authentication
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');
    const targetEmail = selectedGoogleUser ? selectedGoogleUser.email : email;

    if (enteredCode.length !== 6 && enteredCode !== '123456') {
      setErrorMsg("Please enter all 6 digits of your verification OTP.");
      return;
    }

    const verificationResult = authService.verifyOTP(targetEmail, enteredCode);
    if (!verificationResult.success) {
      setErrorMsg(verificationResult.message);
      return;
    }

    // Authentication succeeded!
    if (authChannel === 'google_oauth' && selectedGoogleUser) {
      const loggedUser = authService.completeGoogleAuth(selectedGoogleUser, selectedLang);
      onLogin(loggedUser);
    } else {
      // Credentials flow
      if (isSignup) {
        const newUser: UserProfile = {
          name: name || email.split('@')[0],
          email: email,
          points: 50,
          badges: ['New Explorer', 'Verified Scholar'],
          language: selectedLang,
          isVerified: true,
          testHistory: [],
          answeredQuestionIds: [],
          authProvider: 'email'
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
    }
  };

  // --------------------------------------------------------------------------
  // 1. OTP 2-FACTOR VERIFICATION SCREEN
  // --------------------------------------------------------------------------
  if (showVerification) {
    const displayEmail = selectedGoogleUser ? selectedGoogleUser.email : email;
    const isGoogleAuth = authChannel === 'google_oauth' && selectedGoogleUser;

    return (
      <div className="min-h-screen study-desk-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-12 right-12 w-96 h-96 bg-emerald-700/12 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-12 left-12 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-8 sm:p-10 relative overflow-hidden border border-stone-200/80 z-10 animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-emerald-900 via-emerald-700 to-amber-500"></div>

          {/* User / Google Profile Card Header */}
          <div className="flex flex-col items-center text-center mb-6">
            {isGoogleAuth ? (
              <div className="relative mb-3">
                <img 
                  src={selectedGoogleUser.picture} 
                  alt={selectedGoogleUser.name} 
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-emerald-600/20 shadow-md border-2 border-white"
                />
                <div className="absolute -bottom-1.5 -right-1.5 bg-white p-1.5 rounded-xl shadow-md border border-stone-200 flex items-center justify-center">
                  <GoogleIcon className="w-4 h-4" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200/80 rounded-3xl flex items-center justify-center text-emerald-800 mb-3 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {isGoogleAuth ? "Google Identity Verified" : "Scholar Security Guard"}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 font-serif">
              {isGoogleAuth ? "Google 2-Factor OTP" : strings.verifyEmail}
            </h2>
            <p className="text-stone-500 text-xs font-medium mt-1">
              One-Time Password sent to: <span className="font-bold text-emerald-900">{displayEmail}</span>
            </p>
          </div>

          {/* Interactive Live OTP Demo Alert Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/90 p-4 rounded-2xl mb-6 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 font-mono">Live OTP Passcode</span>
                    <span className="bg-amber-200/80 text-amber-950 font-mono font-black text-[10px] px-2 py-0.5 rounded-md">Demo Sandbox</span>
                  </div>
                  <p className="text-xs text-amber-900 font-bold mt-1">
                    Your code is <span className="text-sm font-black font-mono text-emerald-900 tracking-wider bg-white px-2 py-0.5 rounded border border-amber-300">{activeCode}</span> (or enter PIN <span className="font-mono font-black">123456</span>)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFillCode}
                className="shrink-0 text-[11px] font-black text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
              >
                Auto-fill
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-2xl mb-5 flex items-center gap-2.5 text-xs text-red-700 font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              {errorMsg}
            </div>
          )}

          {resendNotice && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl mb-5 flex items-center gap-2 text-xs text-emerald-800 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              A fresh 6-digit OTP has been issued and sent.
            </div>
          )}

          {/* 6 Individual Digit Boxes */}
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="flex justify-between gap-2 sm:gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-mono font-black bg-stone-50 border-2 border-stone-200 rounded-2xl focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition-all shadow-xs"
                />
              ))}
            </div>

            {/* Countdown Timer & Resend Controls */}
            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <div className="flex items-center gap-1.5 text-stone-500">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                {timerSeconds > 0 ? (
                  <span>Expires in <span className="font-mono font-black text-emerald-900">00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span></span>
                ) : (
                  <span className="text-red-500 font-bold">Code expired</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={timerSeconds > 45}
                className={`flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-black transition-colors ${timerSeconds > 45 ? 'text-stone-300 cursor-not-allowed' : 'text-emerald-800 hover:text-emerald-950 underline'}`}
              >
                <RefreshCw className="w-3 h-3" />
                Resend OTP
              </button>
            </div>

            <button 
              type="submit"
              className="w-full py-4.5 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-black rounded-2xl shadow-xl shadow-emerald-950/20 border border-amber-400/30 transition-all active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              Verify & Launch Scholar Desk
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setShowVerification(false);
                setSelectedGoogleUser(null);
              }} 
              className="text-xs font-bold text-stone-400 hover:text-emerald-800 transition-colors uppercase tracking-widest"
            >
              ← Back to Sign In Methods
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. MAIN LOGIN & GOOGLE AUTH SELECTION VIEW
  // --------------------------------------------------------------------------
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

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-200/80 relative z-10 animate-in fade-in duration-300">
        <div className="h-2.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-amber-500"></div>
        
        <div className="p-8 sm:p-12">
          {/* Brand Logo Crest */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#082218] to-[#041a12] rounded-2xl flex items-center justify-center text-amber-300 shadow-xl border border-amber-400/30 ring-4 ring-emerald-900/10">
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>
          </div>
          
          <div className="text-center mb-7">
            <h1 className="text-3xl font-black text-slate-800 mb-1.5 font-serif">
              {isSignup ? strings.signup : strings.login}
            </h1>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest font-mono">
              MargDarshak AI • Scholar Portal
            </p>
          </div>

          {/* PRIMARY AUTH: PROPER GOOGLE SIGN-IN BUTTON */}
          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 text-slate-700 border-2 border-stone-200 hover:border-emerald-600/50 rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition-all hover:shadow-md active:scale-[0.98] group"
            >
              <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Continue with Google</span>
              <span className="bg-emerald-100/80 text-emerald-900 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ml-1 font-mono">
                2FA OTP
              </span>
            </button>

            {/* Subtle Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-stone-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono shrink-0">
                or continue with credentials
              </span>
              <div className="border-t border-stone-200 w-full"></div>
            </div>
          </div>

          {/* STANDARD CREDENTIALS FORM */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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
                    className="w-full pl-12 pr-4 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-bold text-xs sm:text-sm text-slate-800"
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
                  className="w-full pl-12 pr-4 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-bold text-xs sm:text-sm text-slate-800"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-stone-50/80 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-bold text-xs sm:text-sm text-slate-800"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-emerald-800 text-amber-200 font-black rounded-2xl shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 hover:bg-emerald-900 border border-amber-400/30 transition-all active:scale-95 text-xs uppercase tracking-wider mt-2"
            >
              {isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isSignup ? strings.signup : strings.login} (with OTP)
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="text-emerald-800 font-black text-xs hover:underline uppercase tracking-wider"
            >
              {isSignup ? "Already registered? Scholar Sign In →" : "New student? Create Scholar Account →"}
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. GOOGLE ACCOUNT CHOOSER & AUTH POPUP MODAL                          */}
      {/* ---------------------------------------------------------------------- */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
            {/* Google Header */}
            <div className="p-6 border-b border-stone-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <GoogleIcon className="w-6 h-6" />
                <div>
                  <h3 className="text-base font-black text-slate-800 leading-tight font-serif">
                    Sign in with Google
                  </h3>
                  <p className="text-[11px] font-medium text-stone-400">
                    to continue to <span className="font-bold text-emerald-800">MargDarshak AI</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="p-1.5 text-stone-400 hover:text-slate-800 hover:bg-stone-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account List */}
            <div className="p-6 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono mb-2">
                Choose a verified Google Account
              </p>

              {DEMO_GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleSelectGoogleAccount(acc)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={acc.picture} 
                      alt={acc.name} 
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-stone-200 group-hover:ring-emerald-600 transition-all"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800 group-hover:text-emerald-900">{acc.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-[11px] font-medium text-stone-500">{acc.email}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}

              {/* Use Custom Google Account Form Toggle */}
              {!showCustomGoogle ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogle(true)}
                  className="w-full p-3.5 rounded-2xl border border-dashed border-stone-300 hover:border-emerald-700 hover:bg-stone-50 flex items-center justify-center gap-2 text-xs font-bold text-stone-600 transition-all"
                >
                  <UserPlus className="w-4 h-4 text-emerald-800" />
                  Use another Google Account / Gmail
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="pt-3 border-t border-stone-100 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono">Google Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Deepanshu Agarwal"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 font-mono">Gmail Address</label>
                    <input
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-bold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogle(false)}
                      className="flex-1 py-2 bg-stone-100 text-stone-600 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-black rounded-xl text-xs uppercase tracking-wider"
                    >
                      Continue →
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Privacy note */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
              <p className="text-[10px] text-stone-400 leading-relaxed font-medium">
                To continue, Google will share your name, email address, and profile picture with MargDarshak AI under secure 2-Factor OTP verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
