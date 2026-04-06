
import React, { useMemo } from 'react';
import { Trophy, Crown, Medal, MapPin, ChevronUp, Info, HelpCircle, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { databaseService } from '../services/databaseService';

const Leaderboard: React.FC<{ user: UserProfile, strings: Record<string, string> }> = ({ user, strings }) => {
  const allUsers = useMemo(() => databaseService.getAllUsers(), []);
  
  const eligibleUsers = useMemo(() => {
    return allUsers
      .filter(u => (u.answeredQuestionIds?.length || 0) >= 50)
      .map(u => {
        // Rank based on weighted average accuracy of all past tests
        const testHistory = u.testHistory || [];
        const totalAccuracy = testHistory.reduce((sum, test) => sum + test.accuracy, 0);
        const avgAccuracy = testHistory.length ? Math.round(totalAccuracy / testHistory.length) : 0;
        
        return {
          ...u,
          avgAccuracy,
          questionsCount: u.answeredQuestionIds?.length || 0
        };
      })
      .sort((a, b) => {
        // Sort by accuracy first
        if (b.avgAccuracy !== a.avgAccuracy) return b.avgAccuracy - a.avgAccuracy;
        // Then by volume of questions answered as a tie-breaker
        return b.questionsCount - a.questionsCount;
      });
  }, [allUsers]);

  const userRank = eligibleUsers.findIndex(u => u.email === user.email) + 1;
  const isUserEligible = (user.answeredQuestionIds?.length || 0) >= 50;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
               <Trophy className="w-3.5 h-3.5" /> Accuracy Champions
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Scholastic Leaderboard</h1>
            <p className="text-slate-500 mt-2 font-medium text-lg">Ranking top scholars by accuracy. Minimum 50 unique questions required.</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] max-w-sm">
             <div className="flex items-center gap-3 mb-2">
                <Info className="w-5 h-5 text-amber-600" />
                <h4 className="font-black text-amber-900 text-xs uppercase tracking-widest">Eligibility Criteria</h4>
             </div>
             <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Ranking is determined by <span className="font-black">Average Test Accuracy</span>. You must answer at least <span className="font-black">50 unique questions</span> to qualify for a global rank.
             </p>
          </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        {eligibleUsers.length > 0 ? (
          <>
            <div className="p-8 bg-slate-50 border-b hidden md:flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-12">
              <div className="flex gap-16">
                 <span className="w-12">Rank</span>
                 <span>Student Profile</span>
              </div>
              <div className="flex gap-20">
                 <span className="w-24 text-center">Questions Solved</span>
                 <span className="w-24 text-center">Mean Accuracy</span>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {eligibleUsers.map((leader, index) => {
                const rank = index + 1;
                const isCurrentUser = leader.email === user.email;
                return (
                  <div key={leader.email} className={`flex flex-col md:flex-row items-center justify-between px-8 md:px-12 py-8 transition-all ${isCurrentUser ? 'bg-indigo-600 text-white shadow-inner' : 'hover:bg-slate-50'}`}>
                     <div className="flex items-center gap-6 md:gap-16 w-full md:w-auto mb-4 md:mb-0">
                        <span className={`text-2xl font-black italic w-12 ${isCurrentUser ? 'text-indigo-200' : 'text-slate-300'}`}>
                          #{rank}
                        </span>
                        <div className="flex items-center gap-4">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${isCurrentUser ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                              {leader.name[0]}
                           </div>
                           <div>
                              <span className="font-black text-xl block leading-none mb-1">{leader.name}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${isCurrentUser ? 'text-indigo-100' : 'text-slate-400'}`}>
                                {leader.locality || 'Undisclosed Region'}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between w-full md:w-auto gap-12 md:gap-20">
                        <div className="text-center w-24">
                           <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isCurrentUser ? 'text-indigo-200' : 'text-slate-400'}`}>Solved</p>
                           <p className="text-2xl font-black">{leader.questionsCount}</p>
                        </div>
                        <div className="text-center w-24">
                           <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isCurrentUser ? 'text-indigo-200' : 'text-slate-400'}`}>Accuracy</p>
                           <p className="text-3xl font-black">{leader.avgAccuracy}%</p>
                        </div>
                        <div className="w-8 flex justify-center">
                          {rank <= 3 && <Crown className={`w-6 h-6 ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : 'text-amber-600'}`} />}
                        </div>
                     </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-24 text-center bg-slate-50/50">
             <HelpCircle className="w-16 h-16 mx-auto mb-6 text-slate-200" />
             <p className="text-slate-400 font-black uppercase tracking-widest">Global Board Locked</p>
             <p className="text-sm text-slate-400 mt-2">Finish your first 50 unique questions to see how you compare to India's best!</p>
          </div>
        )}
      </div>

      {!isUserEligible && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col md:flex-row items-center gap-10">
           <div className="w-24 h-24 rounded-full border-8 border-slate-100 flex items-center justify-center relative overflow-hidden">
              <div 
                className="absolute inset-0 border-8 border-indigo-600 transition-all duration-1000" 
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(((user.answeredQuestionIds?.length || 0) / 50) * 2 * Math.PI)}% ${50 - 50 * Math.cos(((user.answeredQuestionIds?.length || 0) / 50) * 2 * Math.PI)}%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`
                }}
              ></div>
              <span className="font-black text-2xl z-10">{user.answeredQuestionIds?.length || 0}</span>
           </div>
           <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-800 mb-2">Qualify for Global Ranking</h3>
              <p className="text-slate-500 font-medium">
                Answer <span className="text-indigo-600 font-black">{50 - (user.answeredQuestionIds?.length || 0)}</span> more questions to unlock your rank!
              </p>
              <div className="mt-6">
                 <a href="#/test" className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:scale-105 transition-all">Solve Questions Now</a>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
