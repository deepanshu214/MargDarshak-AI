
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Added Wallet to the imports list
import { Search, ArrowRight, ShieldCheck, GraduationCap, MapPin, Sparkles, Trophy, Medal, Star, Target, Zap, Users, Loader2, Info, BookOpen, Heart, Wallet } from 'lucide-react';
import { UserProfile } from '../types';
import { getSmartRecommendations } from '../services/geminiService';

const Home: React.FC<{ user: UserProfile; strings: Record<string, string> }> = ({ user, strings }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const currentLevel = Math.floor(user.points / 200) + 1;
  const progress = (user.points % 200) / 200 * 100;

  useEffect(() => {
    const fetchRecs = async () => {
      // Only fetch if profile has some data to suggest things from
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 pb-20">
      {/* Animated Hero Header */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <section className="flex-[2] relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 rounded-[3rem] p-10 md:p-14 text-white overflow-hidden shadow-2xl shadow-indigo-200 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-black tracking-widest uppercase mb-6 w-fit">
              <Zap className="w-4 h-4 text-yellow-300" /> {strings.learning || 'Learning'}
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">
              {strings.welcome || 'Welcome'}, <br /> {user.name}! 🚀
            </h1>
            <p className="text-indigo-100 text-lg mb-10 max-w-lg font-medium leading-relaxed opacity-90">
              Your personalized guide to India's top scholarships and career roadmaps. Let's make your dreams accessible.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/test" className="px-8 py-4 bg-white text-indigo-700 font-black rounded-2xl flex items-center gap-3 hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 hover:-translate-y-1">
                {strings.startTest || 'Take Mock Test'} <Target className="w-5 h-5" />
              </Link>
              <Link to="/chatbot" className="px-8 py-4 bg-indigo-500/30 border border-white/20 text-white font-black rounded-2xl flex items-center gap-3 hover:bg-indigo-500/40 transition-all backdrop-blur-md">
                {strings.aiMentor || 'Talk to AI Mentor'} <Sparkles className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <div className="lg:w-96 bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{strings.rank || 'Rank'} #? • {strings.level || 'Level'} {currentLevel}</span>
              <div className="bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 text-xs font-black">Student</div>
            </div>
            <div className="space-y-2 mb-8">
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>{user.points} {strings.points || 'XP'}</span>
                <span>{currentLevel * 200} {strings.points || 'XP'}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-4 bg-amber-50 rounded-[2rem] border border-amber-100 text-center hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">XP</p>
              <p className="text-2xl font-black text-amber-900 leading-none">{user.points}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-[2rem] border border-purple-100 text-center hover:scale-105 transition-transform">
              <Medal className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-[10px] font-black text-purple-800 uppercase tracking-widest">{strings.badges || 'Badges'}</p>
              <p className="text-2xl font-black text-purple-900 leading-none">{user.badges.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Smart Suggestions Section (Bridge between DB and Suggestions) */}
      <section className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100 overflow-hidden relative">
         <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-[0.03]">
            <Sparkles className="w-64 h-64" />
         </div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
            <div>
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-indigo-600" /> AI Suggestions for You
               </h3>
               <p className="text-2xl font-black text-slate-800 tracking-tight">Personalized Roadmap based on your Database</p>
            </div>
            {(!user.locality || !user.income || !user.caste) && (
              <Link to="/profile" className="px-6 py-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4" /> Complete Profile to get Suggestions
              </Link>
            )}
         </div>

         {loadingRecs ? (
           <div className="py-20 flex flex-col items-center justify-center opacity-40">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-black text-xs uppercase tracking-widest">Analyzing your data...</p>
           </div>
         ) : recommendations.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {recommendations.map((rec, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:border-indigo-200 transition-all hover:shadow-xl">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${rec.type === 'career' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {rec.type === 'career' ? <Target className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                   </div>
                   <h4 className="text-xl font-black text-slate-800 mb-3">{rec.title}</h4>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{rec.description}</p>
                   <Link to={rec.type === 'career' ? "/test" : "/schemes"} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:gap-3 transition-all">
                      View details <ArrowRight className="w-3 h-3" />
                   </Link>
                </div>
              ))}
           </div>
         ) : (
           <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No suggestions yet. Update your profile details.</p>
           </div>
         )}
      </section>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Tile 
          icon={<ShieldCheck className="w-10 h-10" />} 
          title={strings.verifiedSchemes || "Verified Schemes"} 
          desc="Discover 500+ subsidies and grants from Govt & Private entities." 
          link="/schemes"
          color="green"
        />
        <Tile 
          icon={<GraduationCap className="w-10 h-10" />} 
          title={strings.talentSearch || "Talent Search"} 
          desc="Adaptive mock tests to find your academic strengths and careers." 
          link="/test"
          color="orange"
        />
        <Tile 
          icon={<Users className="w-10 h-10" />} 
          title={strings.peerNetwork || "Peer Network"} 
          desc="Connect with mentors and students from similar localities." 
          link="/leaderboard"
          color="blue"
        />
      </div>
    </div>
  );
};

const Tile = ({ icon, title, desc, link, color }: any) => {
  const colors: any = {
    green: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
  };

  return (
    <Link to={link} className={`p-10 rounded-[2.5rem] border-2 transition-all group shadow-sm flex flex-col h-full ${colors[color]}`}>
      <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">{desc}</p>
      <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 group-hover:text-slate-800 transition-colors">
        Learn More <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
};

export default Home;
