import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Play, Pause, RotateCcw, CheckCircle2, Circle, Flame, 
  Sparkles, Calculator, BookOpen, Lightbulb, Save, Trash2, 
  HelpCircle, ArrowRight, Award, Trophy, Volume2, VolumeX, Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { storageService } from '../services/storageService';

interface InteractiveStudyToolsProps {
  user: UserProfile;
  updateProfile: (u: Partial<UserProfile>) => void;
}

const DAILY_QUESTS_KEY = "margdarshak_daily_quests";
const STUDY_SCRATCHPAD_KEY = "margdarshak_study_scratchpad";
const STUDY_TIME_KEY = "margdarshak_study_minutes_today";

// Audio tone synthesizer using standard browser Web Audio API
const playTone = (freq = 520, durationMs = 250) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (_) {}
};

export const InteractiveStudyTools: React.FC<InteractiveStudyToolsProps> = ({ user, updateProfile }) => {
  // 1. Pomodoro Focus Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(() => {
    return storageService.getSync<number>(STUDY_TIME_KEY) || 45;
  });

  // 2. Daily Study Quests State
  const [quests, setQuests] = useState<{ id: string; label: string; xp: number; completed: boolean }[]>(() => {
    const saved = storageService.getSync<any>(DAILY_QUESTS_KEY);
    if (saved && Array.isArray(saved)) return saved;
    return [
      { id: 'q1', label: 'Complete 1 Aptitude or Subject Practice Drill', xp: 30, completed: false },
      { id: 'q2', label: 'Explore & Bookmark 1 Matching Government / CSR Scheme', xp: 20, completed: true },
      { id: 'q3', label: 'Verify 1 Academic or Identity Document in Vault', xp: 25, completed: false }
    ];
  });

  // 3. Scholarship Aid Calculator State
  const [calcIncome, setCalcIncome] = useState(180000);
  const [calcMarks, setCalcMarks] = useState(78);

  // 4. Daily Flashcard State
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);

  // 5. Study Scratchpad State
  const [notes, setNotes] = useState(() => {
    return storageService.getSync<string>(STUDY_SCRATCHPAD_KEY) || "• NSP portal registration deadline: Nov 30\n• Practice solving Speed & Time aptitude problems\n• Revise physics formula sheet";
  });
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // Pomodoro Interval Runner
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playTone(650, 500);
      if (timerMode === 'focus') {
        const newTotal = todayFocusMinutes + 25;
        setTodayFocusMinutes(newTotal);
        storageService.set(STUDY_TIME_KEY, newTotal).catch(() => {});
        updateProfile({ points: (user.points || 0) + 25 });
        setTimerMode('break');
        setTimeLeft(5 * 60);
      } else {
        setTimerMode('focus');
        setTimeLeft(25 * 60);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, timerMode]);

  const toggleTimer = () => {
    playTone(isActive ? 400 : 600, 100);
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const toggleQuest = (questId: string) => {
    playTone(550, 150);
    const updated = quests.map(q => {
      if (q.id === questId) {
        const nextState = !q.completed;
        if (nextState) {
          updateProfile({ points: (user.points || 0) + q.xp });
        }
        return { ...q, completed: nextState };
      }
      return q;
    });
    setQuests(updated);
    storageService.set(DAILY_QUESTS_KEY, updated).catch(() => {});
  };

  const saveNotes = (val: string) => {
    setNotes(val);
    storageService.set(STUDY_SCRATCHPAD_KEY, val).catch(() => {});
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2000);
  };

  // Flashcards bank
  const FLASHCARDS = [
    {
      domain: "Quantitative Aptitude",
      question: "Speed, Distance & Time: What is the shortcut to convert km/h to m/s?",
      answer: "Multiply by 5/18. (To convert m/s back to km/h, multiply by 18/5).",
      tip: "Example: 72 km/h = 72 × (5/18) = 20 m/s."
    },
    {
      domain: "Government Schemes",
      question: "What is the maximum income ceiling for Central PM-YASASVI Scholarship?",
      answer: "₹2,50,000 per annum for OBC, EBC, and DNT students.",
      tip: "Covers tuition fees & monthly boarding allowance up to Class 12."
    },
    {
      domain: "Reasoning & Logic",
      question: "Blood Relations Trick: How to decode 'Pointing to a photograph, A says...'?",
      answer: "Start tracing backwards from the word 'my' or the speaker's own perspective.",
      tip: "Break the sentence down into generational hierarchy trees."
    }
  ];

  const currentFlashcard = FLASHCARDS[flashcardIndex % FLASHCARDS.length];

  // Scholarship Grant Estimation formula
  const estimatedGrant = Math.round(
    calcIncome < 150000 
      ? (calcMarks >= 85 ? 120000 : 75000) 
      : calcIncome < 300000 
      ? (calcMarks >= 85 ? 80000 : 50000)
      : (calcMarks >= 85 ? 60000 : 35000)
  );

  const matchedSchemesCount = calcIncome < 250000 ? (calcMarks >= 80 ? 14 : 9) : (calcMarks >= 80 ? 8 : 4);

  const formatMins = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SECTION 1: STUDY COMPANION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WIDGET 1: FOCUS / POMODORO TIMER */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Focus Sprint
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Today: <strong className="text-emerald-700">{todayFocusMinutes} mins</strong>
              </span>
            </div>

            <div className="text-center py-6">
              <p className="text-5xl font-black text-slate-800 tracking-tight font-mono mb-2">
                {formatMins(timeLeft)}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {timerMode === 'focus' ? '🎯 Deep Study Session' : '☕ Restorative Break'}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex gap-2">
              <button
                onClick={toggleTimer}
                className={`flex-1 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                  isActive 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isActive ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Sprint</>}
              </button>
              <button
                onClick={resetTimer}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center gap-2 text-[10px] font-black uppercase text-slate-400">
              <button
                onClick={() => { setTimerMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
                className={`px-3 py-1 rounded-lg ${timerMode === 'focus' ? 'bg-emerald-100 text-emerald-800' : 'hover:text-slate-600'}`}
              >
                25m Focus
              </button>
              <button
                onClick={() => { setTimerMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                className={`px-3 py-1 rounded-lg ${timerMode === 'break' ? 'bg-emerald-100 text-emerald-800' : 'hover:text-slate-600'}`}
              >
                5m Break
              </button>
            </div>
          </div>
        </div>

        {/* WIDGET 2: DAILY STUDY QUESTS & STREAK */}
        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Daily Scholar Quests
              </span>
              <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> +75 XP Daily
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {quests.map(quest => (
                <button
                  key={quest.id}
                  onClick={() => toggleQuest(quest.id)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    quest.completed 
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-500' 
                      : 'bg-slate-50/80 border-slate-200 hover:border-amber-300 text-slate-800'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {quest.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold leading-snug ${quest.completed ? 'line-through text-slate-400' : ''}`}>
                      {quest.label}
                    </p>
                    <span className="text-[9px] font-black uppercase text-amber-600 mt-0.5 inline-block">
                      +{quest.xp} XP
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Progress: {quests.filter(q => q.completed).length}/{quests.length} Completed</span>
            <span className="text-emerald-600 font-black">
              {quests.every(q => q.completed) ? "🎉 Day Complete!" : "Keep Going!"}
            </span>
          </div>
        </div>

        {/* WIDGET 3: CONCEPT & APTITUDE FLASHCARD */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <Lightbulb className="w-3.5 h-3.5 text-amber-300" /> Flashcard of the Day
              </span>
              <span className="text-[10px] font-bold text-slate-300">
                {currentFlashcard.domain}
              </span>
            </div>

            <div className="min-h-[140px] flex flex-col justify-center py-2">
              <p className="text-xs sm:text-sm font-black text-emerald-100 leading-relaxed mb-3">
                {currentFlashcard.question}
              </p>

              {isCardFlipped ? (
                <div className="p-3 bg-white/10 rounded-2xl border border-white/15 animate-in fade-in">
                  <p className="text-xs font-bold text-amber-300 leading-relaxed mb-1">
                    ✓ {currentFlashcard.answer}
                  </p>
                  <p className="text-[10px] text-slate-300 italic">
                    {currentFlashcard.tip}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs font-bold italic">
                  Tap below to reveal formula & shortcut
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex gap-2">
            <button
              onClick={() => {
                playTone(480, 100);
                setIsCardFlipped(!isCardFlipped);
              }}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition-colors text-center"
            >
              {isCardFlipped ? "Hide Answer" : "Reveal Answer & Trick"}
            </button>
            <button
              onClick={() => {
                setFlashcardIndex(prev => prev + 1);
                setIsCardFlipped(false);
              }}
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors"
              title="Next Card"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE FINANCIAL AID CALCULATOR & STUDY NOTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AID ESTIMATOR (8 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Scholarship Aid Estimator</h3>
                  <p className="text-xs font-bold text-slate-400">Interactive eligibility simulation for Indian schemes</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Interactive Model
              </span>
            </div>

            {/* Sliders */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500">Annual Family Income:</span>
                  <span className="text-emerald-700 font-black">₹{(calcIncome / 100000).toFixed(1)} Lakhs / year</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="800000"
                  step="25000"
                  value={calcIncome}
                  onChange={(e) => setCalcIncome(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>₹50K (BPL)</span>
                  <span>₹2.5L (Post-Matric Cutoff)</span>
                  <span>₹8.0L (EWS Ceiling)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500">Academic Score / Marks:</span>
                  <span className="text-emerald-700 font-black">{calcMarks}% Percentage</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="98"
                  step="1"
                  value={calcMarks}
                  onChange={(e) => setCalcMarks(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                  <span>50% (Passing)</span>
                  <span>75% (Merit Threshold)</span>
                  <span>95%+ (DST/Corporate)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Result Box */}
          <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-teal-50 p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                Potential Financial Assistance Available
              </p>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">
                Up to ₹{estimatedGrant.toLocaleString('en-IN')} <span className="text-xs font-bold text-slate-500">/ academic year</span>
              </p>
              <p className="text-xs font-bold text-slate-500 mt-1">
                You qualify for ~{matchedSchemesCount} Central, State & CSR Scholarship schemes.
              </p>
            </div>
            <a
              href="#/schemes"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 active:scale-95"
            >
              Explore Schemes <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* STUDY SCRATCHPAD (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Scholar's Scratchpad</h3>
                  <p className="text-[11px] font-bold text-slate-400">Quick study notes & portal reminders</p>
                </div>
              </div>
              {isNoteSaved && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            <textarea
              value={notes}
              onChange={(e) => saveNotes(e.target.value)}
              rows={7}
              placeholder="Jot down application registration numbers, test formulas, or study goals..."
              className="w-full p-4 rounded-2xl bg-amber-50/30 border border-amber-200/60 font-medium text-xs text-slate-700 leading-relaxed outline-none focus:border-amber-400 focus:bg-white transition-colors"
            />
          </div>

          <div className="pt-3 flex items-center justify-between text-[11px] text-slate-400 font-bold">
            <span>Auto-saved locally in secure storage</span>
            <button
              onClick={() => saveNotes("")}
              className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
              title="Clear Scratchpad"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
