import React, { useState, useMemo } from 'react';
import { 
  Trophy, Crown, Medal, MapPin, ChevronUp, Info, HelpCircle, 
  CheckCircle2, Sparkles, Flame, Search, Filter, Award, Star
} from 'lucide-react';
import { UserProfile } from '../types';
import { databaseService } from '../services/databaseService';

interface LeaderboardProps {
  user: UserProfile;
  strings: Record<string, string>;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, strings }) => {
  const [scopeFilter, setScopeFilter] = useState<'All India' | 'My State' | 'School' | 'College'>('All India');
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = useMemo(() => databaseService.getAllUsers(), []);
  
  const rankedUsers = useMemo(() => {
    return allUsers
      .map(u => {
        const testHistory = u.testHistory || [];
        const totalAccuracy = testHistory.reduce((sum, test) => sum + test.accuracy, 0);
        const avgAccuracy = testHistory.length ? Math.round(totalAccuracy / testHistory.length) : 75;
        const totalPoints = u.points || 0;
        
        return {
          ...u,
          avgAccuracy,
          totalPoints,
          testsCount: testHistory.length
        };
      })
      .filter(u => {
        // Scope Filter
        if (scopeFilter === 'My State' && user.locality && u.locality !== user.locality) return false;
        if (scopeFilter === 'School' && u.educationLevel !== 'School') return false;
        if (scopeFilter === 'College' && u.educationLevel !== 'College') return false;

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return u.name.toLowerCase().includes(q) || (u.locality && u.locality.toLowerCase().includes(q));
        }
        return true;
      })
      .sort((a, b) => {
        // Sort primarily by XP points, secondary by accuracy
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return b.avgAccuracy - a.avgAccuracy;
      });
  }, [allUsers, scopeFilter, searchQuery, user.locality]);

  const userRankIndex = rankedUsers.findIndex(u => u.email === user.email);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 'Unranked';

  const top3 = rankedUsers.slice(0, 3);
  const restOfUsers = rankedUsers.slice(3);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto pb-24 space-y-10 animate-in fade-in duration-500">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-amber-300 border border-white/10 mb-3">
            <Trophy className="w-3.5 h-3.5" /> National Merit & Talent Rankings
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Scholastic Leaderboard
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm font-bold mt-1.5 max-w-xl">
            Recognizing academic excellence, consistency, and problem-solving talent among India's brightest aspirants.
          </p>
        </div>

        {/* User Current Rank Chip */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 bg-amber-400 text-slate-900 font-black rounded-xl flex items-center justify-center text-lg shadow-md">
            #{userRank}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-200">Your Current Rank</p>
            <p className="text-sm font-black text-white">{user.points || 0} Total XP Points</p>
            <p className="text-[11px] font-bold text-emerald-400 mt-0.5">Keep testing to climb higher!</p>
          </div>
        </div>
      </div>

      {/* Scope Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {(['All India', 'My State', 'School', 'College'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setScopeFilter(tab)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                scopeFilter === tab 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'My State' ? `📍 ${user.locality || 'My State'}` : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 font-bold text-xs focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Top 3 Podium (When available) */}
      {top3.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          
          {/* Rank 2 - Silver */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md text-center flex flex-col justify-between order-2 sm:order-1 sm:mt-6">
            <div>
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center font-black text-lg mx-auto mb-3 shadow-inner">
                🥈 2
              </div>
              <h3 className="font-black text-base text-slate-800">{top3[1].name}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">{top3[1].locality || 'India'}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-xl font-black text-indigo-600">{top3[1].totalPoints} XP</p>
              <p className="text-[10px] font-bold text-slate-400">{top3[1].avgAccuracy}% Accuracy</p>
            </div>
          </div>

          {/* Rank 1 - Gold */}
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-8 border-2 border-amber-300 shadow-xl text-center flex flex-col justify-between order-1 sm:order-2">
            <div>
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-900 rounded-3xl flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-lg ring-4 ring-amber-100">
                👑 1
              </div>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                National Leader
              </span>
              <h3 className="font-black text-lg text-slate-800 mt-2">{top3[0].name}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">{top3[0].locality || 'India'}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-100">
              <p className="text-2xl font-black text-amber-600">{top3[0].totalPoints} XP</p>
              <p className="text-xs font-bold text-slate-500">{top3[0].avgAccuracy}% Mean Accuracy</p>
            </div>
          </div>

          {/* Rank 3 - Bronze */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md text-center flex flex-col justify-between order-3 sm:order-3 sm:mt-10">
            <div>
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center font-black text-lg mx-auto mb-3 shadow-inner">
                🥉 3
              </div>
              <h3 className="font-black text-base text-slate-800">{top3[2].name}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">{top3[2].locality || 'India'}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-xl font-black text-indigo-600">{top3[2].totalPoints} XP</p>
              <p className="text-[10px] font-bold text-slate-400">{top3[2].avgAccuracy}% Accuracy</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Leaderboard List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-8">
            <span className="w-10">Rank</span>
            <span>Scholar Profile</span>
          </div>
          <div className="flex items-center gap-10">
            <span className="hidden sm:inline w-20 text-center">Accuracy</span>
            <span className="w-24 text-right">Points (XP)</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {rankedUsers.map((u, idx) => {
            const rank = idx + 1;
            const isMe = u.email === user.email;

            return (
              <div 
                key={u.email || idx} 
                className={`p-4 sm:p-6 flex items-center justify-between transition-colors ${
                  isMe ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Left: Rank + Info */}
                <div className="flex items-center gap-6 sm:gap-8">
                  <span className={`w-10 text-sm font-black ${
                    rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-amber-700' : 'text-slate-400'
                  }`}>
                    #{rank}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-800">{u.name}</span>
                      {isMe && (
                        <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-300" />
                      {u.locality || 'India'} • {u.fieldOfStudy || u.educationLevel || 'Student'}
                    </p>
                  </div>
                </div>

                {/* Right: Accuracy & XP */}
                <div className="flex items-center gap-10">
                  <div className="hidden sm:block text-center w-20">
                    <span className="text-xs font-black text-emerald-600">{u.avgAccuracy}%</span>
                  </div>
                  <div className="text-right w-24">
                    <span className="text-sm font-black text-indigo-600">{u.totalPoints} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
