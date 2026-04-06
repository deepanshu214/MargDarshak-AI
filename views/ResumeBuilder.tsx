
import React, { useState } from 'react';
import { Sparkles, Loader2, Printer, Target, Star, FileText, User, GraduationCap, MapPin, Trophy, CheckCircle2, Briefcase } from 'lucide-react';
import { UserProfile, ResumeData } from '../types';
import { generateAiResume } from '../services/geminiService';

const ResumeBuilder: React.FC<{ user: UserProfile, updateProfile: (u: Partial<UserProfile>) => void, strings: Record<string, string> }> = ({ user, updateProfile, strings }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const resume = user.resumeData;

  const handleGenerate = async () => {
    setIsGenerating(true);
    const data = await generateAiResume(user);
    if (data) updateProfile({ resumeData: data });
    setIsGenerating(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-20 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">{strings.aiResumeBuilder}</h1>
        <button onClick={handleGenerate} disabled={isGenerating} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50">
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {strings.generateWithAi}
        </button>
      </div>

      {!resume && !isGenerating ? (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed text-center">
           <FileText className="w-16 h-16 mx-auto mb-6 text-slate-200" />
           <p className="text-slate-400 font-black uppercase tracking-widest">{strings.summary} Not Found</p>
        </div>
      ) : isGenerating ? (
        <div className="bg-white p-20 rounded-[3rem] flex flex-col items-center">
           <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mb-6" />
           <p className="font-black">Generating Your Professional Profile...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
             <div className="p-16 bg-slate-50 border-b">
                <h2 className="text-5xl font-black text-slate-800 mb-4">{user.name}</h2>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{resume?.education.level} • {resume?.education.field}</p>
             </div>
             <div className="p-16 space-y-12">
                <section>
                   <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-3"><User className="w-5 h-5" /> {strings.summary}</h3>
                   <p className="text-lg text-slate-700 font-medium leading-relaxed">{resume?.summary}</p>
                </section>
                <div className="grid grid-cols-2 gap-12">
                   <section>
                      <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-3"><Star className="w-5 h-5" /> {strings.skills}</h3>
                      <div className="flex flex-wrap gap-3">{resume?.skills.map((s, i) => <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold">{s}</span>)}</div>
                   </section>
                   <section>
                      <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-3"><Trophy className="w-5 h-5" /> {strings.achievements}</h3>
                      <ul className="space-y-4">{resume?.achievements.map((a, i) => <li key={i} className="flex gap-4 font-medium"><CheckCircle2 className="w-5 h-5 text-green-500" /> {a}</li>)}</ul>
                   </section>
                </div>
                <section className="bg-slate-50 p-10 rounded-[2.5rem]">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3"><Target className="w-5 h-5" /> {strings.careerPaths}</h3>
                   <div className="flex flex-wrap gap-4">{resume?.suggestedRoles.map((r, i) => <div key={i} className="px-6 py-3 bg-white rounded-xl border font-black">{r}</div>)}</div>
                </section>
             </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
