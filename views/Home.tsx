import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, ArrowRight, ShieldCheck, GraduationCap, MapPin, Sparkles, 
  Trophy, Medal, Star, Target, Zap, Users, Loader2, Info, BookOpen, 
  Heart, Wallet, Flame, ArrowUpRight, CheckCircle2, Bookmark
} from 'lucide-react';
import { UserProfile } from '../types';
import { getSmartRecommendations } from '../services/geminiService';
import { InteractiveStudyTools } from '../components/InteractiveStudyTools';

interface HomeProps {
  user: UserProfile;
  updateProfile?: (u: Partial<UserProfile>) => void;
  strings: Record<string, string>;
}

const Home: React.FC<HomeProps> = ({ user, updateProfile = () => {}, strings }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const currentLevel = Math.floor((user.points || 0) / 200) + 1;
  const progress = ((user.points || 0) % 200) / 200 * 100;

  useEffect(() => {
    const fetchRecs = async () => {
      if (user.locality || user.income || user.caste) {
        setLoadingRecs(true);
        const recs = await getSmartRecommendations(user);
        setRecommendations(recs);
        setLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [user.locality, user.income, user.caste, user.interest, user.language]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in duration-500">
      
      {/* ACADEMIC STUDY HERO HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Main Scholar Welcome Card (8 cols) */}
        <section className="lg:col-span-8 relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white overflow-hidden shadow-xl border border-emerald-950 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-amber-300 border border-white/10">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Active Scholar Streak • 5 Days
              </span>
              <span className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-400/20">
                Level {currentLevel} Aspirant
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight tracking-tight">
              Welcome to Your Study Lounge, <br />
              <span className="text-amber-300">{user.name}</span> 📚
            </h1>

            <p className="text-emerald-100/80 text-xs sm:text-sm mb-8 max-w-xl font-medium leading-relaxed">
              Your personalized academic & scholarship command center. Discover verified government financial aid, practice timed talent evaluations, and receive multilingual mentorship.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link 
                to="/test" 
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl flex items-center gap-2 text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95"
              >
                <Target className="w-4 h-4" /> Start Practice Assessment
              </Link>
              <Link 
                to="/schemes" 
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl flex items-center gap-2 text-xs uppercase tracking-wider border border-white/20 backdrop-blur-sm transition-all"
              >
                <Wallet className="w-4 h-4 text-emerald-300" /> Discover Scholarships
              </Link>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-200/90 font-bold">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> {user.locality || 'India'} • {user.educationLevel || 'School/College'}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> MargDarshak Trust Index: {user.trustScore || 80}%
            </span>
          </div>
        </section>

        {/* Scholar XP & Progress Podium Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Academic Standing</span>
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>

            <div className="text-center py-4">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-3xl mx-auto flex items-center justify-center font-black text-2xl text-slate-900 shadow-md ring-4 ring-amber-50 mb-3">
                👑
              </div>
              <h3 className="text-2xl font-black text-slate-800">{user.points || 0} XP</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Scholar Level {currentLevel}
              </p>
            </div>

            {/* Level Progress */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Progress to Level {currentLevel + 1}</span>
                <span className="text-emerald-700 font-black">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 flex gap-3">
            <Link 
              to="/leaderboard" 
              className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Medal className="w-3.5 h-3.5 text-amber-500" /> Leaderboard
            </Link>
            <Link 
              to="/profile" 
              className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black rounded-xl text-xs text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Trust Vault
            </Link>
          </div>
        </div>
      </div>

      {/* INTERACTIVE STUDY COMPANION TOOLS (Focus Timer, Quests, Flashcard, Aid Estimator, Notes) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Interactive Scholar Tools
            </h2>
            <p className="text-xs font-bold text-slate-400">Pomodoro focus sprint, daily quests, flashcards & instant scholarship calculations</p>
          </div>
        </div>

        <InteractiveStudyTools user={user} updateProfile={updateProfile} />
      </div>

      {/* SMART AI SCHOLARSHIP RECOMMENDATIONS CAROUSEL */}
      {(user.locality || user.income || user.caste) && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Recommended Next Steps & Schemes</h3>
                <p className="text-xs font-bold text-slate-400">Curated specifically for your academic and economic criteria</p>
              </div>
            </div>
            <Link to="/schemes" className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              View All Schemes →
            </Link>
          </div>

          {loadingRecs ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs font-bold">Personalizing scholarship matches...</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      rec.type === 'scheme' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {rec.type === 'scheme' ? 'Verified Scheme' : 'Academic Action'}
                    </span>
                    <h4 className="text-sm font-black text-slate-800 mt-2.5 line-clamp-2">{rec.title}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed line-clamp-3">{rec.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <Link 
                      to={rec.type === 'scheme' ? "/schemes" : "/test"} 
                      className="text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      Take Action <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs font-bold">
              Update your income, caste, and state in <Link to="/profile" className="text-emerald-600 underline">Profile</Link> to unlock AI tailored schemes.
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
