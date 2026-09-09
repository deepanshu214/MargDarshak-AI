import React, { useState } from 'react';
import { 
  Sparkles, Loader2, Printer, Target, Star, FileText, User, 
  GraduationCap, MapPin, Trophy, CheckCircle2, Briefcase, Plus, 
  Trash2, Download, Edit3, Check
} from 'lucide-react';
import { UserProfile, ResumeData } from '../types';
import { generateAiResume } from '../services/geminiService';

interface ResumeBuilderProps {
  user: UserProfile;
  updateProfile: (u: Partial<UserProfile>) => void;
  strings: Record<string, string>;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ user, updateProfile, strings }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const resume: ResumeData = user.resumeData || {
    summary: `Dedicated and ambitious student from ${user.locality || 'India'} pursuing studies in ${user.fieldOfStudy || 'Academics'}. Demonstrated aptitude in problem solving with a commitment to continuous learning and community impact.`,
    skills: [
      "Analytical Thinking",
      "Problem Solving",
      `${user.fieldOfStudy || 'Core Domain'} Fundamentals`,
      "Time Management",
      "Digital Literacy"
    ],
    achievements: [
      `Earned ${user.points || 150} XP in MargDarshak National Talent Evaluation`,
      user.testHistory?.length ? `Completed ${user.testHistory.length} comprehensive assessments` : "Active participant in regional academic assessments",
      `Trust Index: ${user.trustScore || 80}% Verified Profile`
    ],
    education: {
      institution: `${user.locality || 'State'} Educational Institution`,
      level: user.educationLevel || 'School',
      field: user.fieldOfStudy || 'General'
    },
    suggestedRoles: [
      user.educationLevel === 'College' ? "Junior Analyst / Trainee" : "Higher Secondary Scholar",
      "Government / CSR Scholar",
      "Apprentice / Intern"
    ]
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const data = await generateAiResume(user);
    if (data) {
      updateProfile({ resumeData: data });
    }
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const updateResumeField = (updates: Partial<ResumeData>) => {
    const updated = { ...resume, ...updates };
    updateProfile({ resumeData: updated });
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    updateResumeField({ skills: [...resume.skills, newSkill.trim()] });
    setNewSkill('');
  };

  const removeSkill = (idx: number) => {
    updateResumeField({ skills: resume.skills.filter((_, i) => i !== idx) });
  };

  const addAchievement = () => {
    if (!newAchievement.trim()) return;
    updateResumeField({ achievements: [...resume.achievements, newAchievement.trim()] });
    setNewAchievement('');
  };

  const removeAchievement = (idx: number) => {
    updateResumeField({ achievements: resume.achievements.filter((_, i) => i !== idx) });
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-24 space-y-8 animate-in fade-in duration-500">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight font-serif">
            ATS Student Resume Builder
          </h1>
          <p className="text-xs sm:text-sm font-bold text-stone-500 mt-1">
            Tailored for Indian government scholarships, CSR apprenticeships, and entry-level roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
              isEditing ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black' : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Done Editing' : 'Edit Resume'}
          </button>
          
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating} 
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-black rounded-xl text-xs flex items-center gap-2 shadow-xs border border-amber-400/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            Regenerate with AI
          </button>

          <button 
            onClick={handlePrint}
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-stone-100 font-black rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Resume Paper Document */}
      <div className="bg-white rounded-3xl shadow-lg border border-stone-200/80 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Strip */}
        <div className="p-8 sm:p-12 bg-[#082218] text-white flex flex-col sm:flex-row sm:items-end justify-between gap-6 print:bg-[#082218] print:text-white border-b border-emerald-900/60">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-serif">{user.name}</h2>
            <p className="text-xs sm:text-sm font-bold text-amber-300 mt-1 uppercase tracking-wider font-mono">
              {resume.education.level} • {resume.education.field} Candidate
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-emerald-200/80 space-y-1 font-medium">
            <p className="flex items-center sm:justify-end gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> {user.locality || 'India'}</p>
            <p>{user.email}</p>
            {user.phone && <p>+91 {user.phone}</p>}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 space-y-8">
          
          {/* Professional Summary */}
          <section className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2 border-b pb-1.5 border-stone-200 font-mono">
              <User className="w-4 h-4 text-emerald-700" /> Professional Summary
            </h3>
            {isEditing ? (
              <textarea
                value={resume.summary}
                onChange={(e) => updateResumeField({ summary: e.target.value })}
                rows={3}
                className="w-full p-3 border rounded-xl font-medium text-xs text-slate-700 focus:border-emerald-600 outline-none"
              />
            ) : (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {resume.summary}
              </p>
            )}
          </section>

          {/* Education */}
          <section className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2 border-b pb-1.5 border-stone-200 font-mono">
              <GraduationCap className="w-4 h-4 text-emerald-700" /> Academic Qualifications
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200 gap-2">
              <div>
                <p className="text-xs sm:text-sm font-black text-slate-800">{resume.education.institution}</p>
                <p className="text-xs font-bold text-stone-500">{resume.education.level} in {resume.education.field}</p>
              </div>
              <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0 font-mono">
                Active Enrolment
              </span>
            </div>
          </section>

          {/* Skills & Competencies */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2 border-b pb-1.5 border-stone-200 font-mono">
              <Star className="w-4 h-4 text-emerald-700" /> Core Skills & Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((s, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 rounded-xl bg-stone-100 text-slate-800 text-xs font-bold flex items-center gap-2 border border-stone-200"
                >
                  {s}
                  {isEditing && (
                    <button onClick={() => removeSkill(idx)} className="text-stone-400 hover:text-rose-500">
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Python, Accounting, Tally)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="px-3 py-1.5 border rounded-xl text-xs font-bold outline-none flex-1 max-w-xs focus:border-emerald-600"
                />
                <button onClick={addSkill} className="px-3 py-1.5 bg-emerald-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-400/30">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            )}
          </section>

          {/* Achievements & Recognitions */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2 border-b pb-1.5 border-stone-200 font-mono">
              <Trophy className="w-4 h-4 text-emerald-700" /> Key Recognitions & Achievements
            </h3>
            <ul className="space-y-2">
              {resume.achievements.map((ach, idx) => (
                <li key={idx} className="flex items-start justify-between gap-3 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{ach}</span>
                  </div>
                  {isEditing && (
                    <button onClick={() => removeAchievement(idx)} className="text-stone-400 hover:text-rose-500 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {isEditing && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add academic achievement or competition..."
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  className="px-3 py-1.5 border rounded-xl text-xs font-bold outline-none flex-1 focus:border-emerald-600"
                />
                <button onClick={addAchievement} className="px-3 py-1.5 bg-emerald-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-400/30">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            )}
          </section>

          {/* Target Roles */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2 border-b pb-1.5 border-stone-200 font-mono">
              <Briefcase className="w-4 h-4 text-emerald-700" /> Target Roles & Scholarship Avenues
            </h3>
            <div className="flex flex-wrap gap-2">
              {resume.suggestedRoles.map((role, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold font-mono">
                  {role}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
