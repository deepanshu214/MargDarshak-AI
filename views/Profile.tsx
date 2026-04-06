
import React, { useState } from 'react';
import { User, MapPin, Shield, CheckCircle2, X, FileCheck, Heart, Wallet, BookOpen, Clock, TrendingUp, ChevronRight, Award, BrainCircuit, Target, CheckCircle, XCircle, ChevronDown, Youtube, Book, Globe, ExternalLink, History, FileSearch, HelpCircle } from 'lucide-react';
import { UserProfile, TestRecord } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_TEST_QUESTIONS } from '../constants';

const Profile: React.FC<{ user: UserProfile; setUser: (u: UserProfile) => void, updateProfile: (u: Partial<UserProfile>) => void, strings: Record<string, string> }> = ({ user, setUser, updateProfile, strings }) => {
  const [formData, setFormData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [showAnswerKeyId, setShowAnswerKeyId] = useState<string | null>(null);

  const handleSave = () => {
    updateProfile({ ...formData });
    setIsEditing(false);
  };

  const verifiedDocs = user.verifiedDocuments || {};
  const isDocVerified = (id: string) => verifiedDocs[id]?.status === 'verified';

  const verificationSteps = [
    { key: 'locality', label: 'Region / Locality', value: user.locality, icon: <MapPin className="w-4 h-4" /> },
    { key: 'caste', label: 'Caste Category', value: user.caste, icon: <User className="w-4 h-4" /> },
    { key: 'income', label: 'Income Group', value: user.income, icon: <Wallet className="w-4 h-4" /> },
    { key: 'aadhaar', label: 'ID Proof (Aadhaar)', value: isDocVerified('aadhaar') ? 'Verified' : '', icon: <FileCheck className="w-4 h-4" /> },
  ];

  const verificationPercent = Math.round((verificationSteps.filter(s => s.value).length / verificationSteps.length) * 100);

  const chartData = (user.testHistory || []).slice().reverse().map(test => ({
    name: new Date(test.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: test.score,
    accuracy: test.accuracy
  }));

  const toggleTest = (id: string) => {
    setExpandedTestId(expandedTestId === id ? null : id);
  };

  const renderAnswerKey = (test: TestRecord) => {
    if (!test.attempts) return <p className="text-slate-400 font-bold italic p-6">No answer data available for this session.</p>;

    return (
      <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-inner max-h-[500px] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
           <HelpCircle className="w-5 h-5 text-indigo-600" />
           <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Review Answer Key</h4>
        </div>
        {test.attempts.map((attempt, idx) => {
          const q = MOCK_TEST_QUESTIONS.find(question => question.id === attempt.questionId);
          if (!q) return null;
          const options = q.options[user.language || 'en'] || q.options['en'];
          const questionText = q.text[user.language || 'en'] || q.text['en'];
          
          return (
            <div key={idx} className={`p-5 rounded-2xl border-2 transition-all ${attempt.isCorrect ? 'bg-green-50/30 border-green-100' : 'bg-rose-50/30 border-rose-100'}`}>
              <div className="flex justify-between items-start mb-3">
                 <p className="text-sm font-bold text-slate-800 leading-relaxed pr-4">{idx + 1}. {questionText}</p>
                 {attempt.isCorrect ? (
                   <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                 ) : (
                   <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                 )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Your Answer</p>
                    <p className={`text-xs font-black ${attempt.isCorrect ? 'text-green-600' : 'text-rose-600'}`}>
                       {attempt.chosenOptionIdx !== null ? options[attempt.chosenOptionIdx] : "Skipped"}
                    </p>
                 </div>
                 {!attempt.isCorrect && (
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Correct Answer</p>
                      <p className="text-xs font-black text-emerald-600">{options[attempt.correctAnswerIdx]}</p>
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20 space-y-10 animate-in fade-in duration-500">
      
      {/* Profile Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3rem] overflow-hidden shadow-xl border border-slate-100">
          <div className="h-48 bg-gradient-to-r from-indigo-700 to-blue-800 relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          <div className="px-10 pb-10 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex flex-col items-start">
                <div className="w-40 h-40 rounded-[2.5rem] bg-white p-3 shadow-2xl mb-6 ring-8 ring-indigo-50">
                  <div className="w-full h-full bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-300">
                    <User className="w-20 h-20" />
                  </div>
                </div>
                <div>
                   <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{user.name}</h2>
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Learner Level {Math.floor(user.points / 200) + 1}</p>
                </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`px-8 py-4 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 ${isEditing ? 'bg-green-600' : 'bg-indigo-600'}`}>
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 flex flex-col justify-between">
           <div>
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-slate-800 flex items-center gap-3 text-lg"><Shield className="w-6 h-6 text-indigo-600" /> Trust Index</h3>
                 <p className="text-3xl font-black text-indigo-600">{verificationPercent}%</p>
              </div>
              <div className="space-y-3">
                 {verificationSteps.map(step => (
                   <div key={step.key} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${step.value ? 'bg-green-50/40 border-green-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${step.value ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>{step.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{step.label}</span>
                     </div>
                     {step.value ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-slate-300" />}
                   </div>
                 ))}
              </div>
           </div>
           <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4">
              <Award className="w-10 h-10 text-yellow-500" />
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievements</p>
                 <p className="text-sm font-black text-slate-800">{user.badges.length} Badges Earned</p>
              </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 px-4">
         <button onClick={() => setActiveTab('details')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'details' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            Details & Eligibility
            {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></div>}
         </button>
         <button onClick={() => setActiveTab('history')} className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            Assessment History
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></div>}
         </button>
      </div>

      {activeTab === 'details' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-400 mb-8 text-[10px] uppercase tracking-[0.2em]">{strings.basicInfo}</h3>
            <div className="space-y-8">
              <ProfileField label={strings.fullName} value={formData.name} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, name: v})} />
              <ProfileField label="Current Education Level" value={formData.educationLevel || ''} isEditing={isEditing} type="select" options={['School', 'College']} onChange={(v: string) => setFormData({...formData, educationLevel: v as any})} />
              <ProfileField label="Interests / Field" value={formData.interest || ''} isEditing={isEditing} icon={<Heart className="w-4 h-4" />} onChange={(v: string) => setFormData({...formData, interest: v})} />
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-400 mb-8 text-[10px] uppercase tracking-[0.2em]">Socio-Economic Data</h3>
            <div className="space-y-8">
              <ProfileField label="Region / Locality" value={formData.locality || ''} isEditing={isEditing} icon={<MapPin className="w-4 h-4" />} onChange={(v: string) => setFormData({...formData, locality: v})} />
              <ProfileField label="Category / Caste" value={formData.caste || ''} isEditing={isEditing} icon={<User className="w-4 h-4" />} onChange={(v: string) => setFormData({...formData, caste: v})} />
              <ProfileField label="Family Annual Income" value={formData.income || ''} isEditing={isEditing} icon={<Wallet className="w-4 h-4" />} onChange={(v: string) => setFormData({...formData, income: v})} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           {/* Performance Chart */}
           {chartData.length > 0 ? (
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                <div className="flex items-center justify-between mb-10">
                   <div>
                      <h3 className="text-xl font-black text-slate-800">Growth Tracking</h3>
                      <p className="text-xs font-medium text-slate-400">Score & Accuracy progression</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600"></div> <span className="text-[10px] font-black uppercase text-slate-400">Score</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> <span className="text-[10px] font-black uppercase text-slate-400">Accuracy %</span></div>
                   </div>
                </div>
                <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                         <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                         <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                         <Tooltip 
                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                            itemStyle={{fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'}}
                         />
                         <Area type="monotone" dataKey="score" stroke="#4f46e5" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                         <Area type="monotone" dataKey="accuracy" stroke="#10b981" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>
           ) : (
             <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-6 text-slate-200" />
                <p className="text-slate-400 font-black uppercase tracking-widest">No Assessment History Yet</p>
                <p className="text-xs font-medium text-slate-400 mt-2">Take your first mock test to see your progress!</p>
             </div>
           )}

           {/* History List */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                 <h3 className="font-black text-slate-800">Field Analysis History</h3>
                 <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">{user.testHistory?.length || 0} Total Tests</span>
              </div>
              <div className="divide-y divide-slate-50">
                 {(user.testHistory || []).map((test, idx) => (
                   <div key={test.id || idx} className="group">
                      <div className="w-full p-8 flex flex-col md:flex-row items-center justify-between hover:bg-slate-50/50 transition-all text-left">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                           <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                              <BrainCircuit className="w-6 h-6" />
                           </div>
                           <div>
                              <h4 className="text-lg font-black text-slate-800">{test.field}</h4>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(test.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6 md:gap-10 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                           <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Breakdown</p>
                              <p className="text-xs font-black text-slate-600">S: {test.breakdown.subjectCorrect}/{test.breakdown.subjectTotal} • L: {test.breakdown.logicalCorrect}/{test.breakdown.logicalTotal}</p>
                           </div>
                           <div className="text-right w-24">
                              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Accuracy</p>
                              <p className="text-2xl font-black text-emerald-500">{test.accuracy}%</p>
                           </div>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => setShowAnswerKeyId(showAnswerKeyId === test.id ? null : test.id)}
                                className={`p-3 rounded-xl border transition-all ${showAnswerKeyId === test.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600 hover:border-indigo-200'}`}
                                title="View Answer Key"
                              >
                                <History className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => toggleTest(test.id)}
                                className={`p-3 rounded-xl border transition-all ${expandedTestId === test.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600 hover:border-indigo-200'}`}
                                title="Detailed Analysis"
                              >
                                <ChevronDown className={`w-5 h-5 transition-transform ${expandedTestId === test.id ? 'rotate-180' : ''}`} />
                              </button>
                           </div>
                        </div>
                      </div>
                      
                      {showAnswerKeyId === test.id && (
                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                           {renderAnswerKey(test)}
                        </div>
                      )}

                      {expandedTestId === test.id && (
                        <div className="p-10 bg-indigo-50/30 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                           {test.analysis ? (
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                   <div>
                                      <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> AI Field Insights</h5>
                                      <div className="grid grid-cols-2 gap-4">
                                         <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Strengths</p>
                                            <ul className="space-y-2">
                                               {test.analysis.strengths.map((s, i) => <li key={i} className="text-xs font-bold text-slate-700 flex gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {s}</li>)}
                                            </ul>
                                         </div>
                                         <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Weaknesses</p>
                                            <ul className="space-y-2">
                                               {test.analysis.weaknesses.map((w, i) => <li key={i} className="text-xs font-bold text-slate-700 flex gap-2"><XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {w}</li>)}
                                            </ul>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm">
                                      <p className="text-[9px] font-black text-indigo-600 uppercase mb-2">Career Suitability</p>
                                      <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{test.analysis.careerFit}"</p>
                                      <div className="mt-4 pt-4 border-t border-slate-100">
                                         <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Growth Action Plan</p>
                                         <p className="text-xs font-black text-slate-700">{test.analysis.actionPlan}</p>
                                      </div>
                                   </div>
                                </div>
                                
                                <div className="space-y-6">
                                   <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Recommended Learning</h5>
                                   <div className="grid grid-cols-1 gap-4">
                                      {(test.resources || []).map((res, i) => (
                                        <div key={i} className="bg-white p-5 rounded-2xl border border-indigo-100 flex justify-between items-center group/item hover:border-indigo-400 transition-all">
                                           <div className="flex items-center gap-4">
                                              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                                 {res.type?.toLowerCase().includes('youtube') ? <Youtube className="w-4 h-4" /> : res.type?.toLowerCase().includes('book') ? <Book className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                              </div>
                                              <div>
                                                 <p className="text-xs font-black text-slate-800">{res.name}</p>
                                                 <p className="text-[10px] text-slate-400 font-bold uppercase">{res.type}</p>
                                              </div>
                                           </div>
                                           <a href={res.link} target="_blank" className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                              <ExternalLink className="w-4 h-4" />
                                           </a>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                             </div>
                           ) : (
                             <p className="text-center text-slate-400 font-bold text-sm">Detailed analysis not available for this record.</p>
                           )}
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ProfileField = ({ label, value, isEditing, onChange, type = "text", icon, options }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </label>
    {isEditing ? (
      type === 'select' ? (
        <select value={value} onChange={(e) => onChange?.(e.target.value)} className="w-full px-5 py-4 border-2 rounded-2xl bg-slate-50 font-bold focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer">
           <option value="">Select Option</option>
           {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} className="w-full px-5 py-4 border-2 rounded-2xl bg-slate-50 font-bold focus:border-indigo-500 outline-none transition-all" />
      )
    ) : (
      <div className="flex items-center justify-between group">
         <p className="font-black text-xl text-slate-800 leading-none">{value || 'Not Provided'}</p>
         {!value && <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">Required</span>}
      </div>
    )}
  </div>
);

export default Profile;
