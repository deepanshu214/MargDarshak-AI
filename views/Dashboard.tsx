
import React, { useState, useRef, useEffect } from 'react';
import { Filter, ExternalLink, CheckCircle2, ChevronDown, X, FileText, ShieldCheck, Banknote, MapPin, GraduationCap, UserCheck, Upload, Loader2, Trash2, Check, Sparkles, Star, ArrowUpRight, Wallet, Info } from 'lucide-react';
import { SAMPLE_SCHEMES } from '../constants';
import { UserProfile, VerifiedDocument } from '../types';
import { getSmartRecommendations } from '../services/geminiService';

const Camera = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;

const DOCUMENT_DEFINITIONS = [
  { id: 'aadhaar', label: 'Aadhaar Card', icon: <UserCheck className="w-5 h-5" />, desc: 'Primary identity & address proof' },
  { id: 'income', label: 'Income Certificate', icon: <Banknote className="w-5 h-5" />, desc: 'Valid certificate (less than 1 year old)' },
  { id: 'caste', label: 'Caste Certificate', icon: <ShieldCheck className="w-5 h-5" />, desc: 'Required for SC/ST/OBC category benefits' },
  { id: 'domicile', label: 'Domicile Certificate', icon: <MapPin className="w-5 h-5" />, desc: 'Proof of residence for state schemes' },
  { id: 'marksheet', label: 'Latest Marksheet', icon: <GraduationCap className="w-5 h-5" />, desc: 'Previous academic year record' },
  { id: 'passbook', label: 'Bank Passbook', icon: <FileText className="w-5 h-5" />, desc: 'Required for DBT (scholarship transfer)' },
  { id: 'photo', label: 'Passport Photos', icon: <Camera className="w-5 h-5" />, desc: 'Scanned digital copy (below 50KB)' },
];

const Dashboard: React.FC<{ user: UserProfile, updateProfile: (u: Partial<UserProfile>) => void, strings: Record<string, string> }> = ({ user, updateProfile, strings }) => {
  const [filter, setFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiSchemes, setAiSchemes] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const lang = user.language || 'en';

  useEffect(() => {
    const fetchPersonalized = async () => {
      if (user.locality || user.income || user.caste) {
        setLoadingAi(true);
        const recs = await getSmartRecommendations(user);
        setAiSchemes(recs.filter((r: any) => r.type === 'scheme'));
        setLoadingAi(false);
      }
    };
    fetchPersonalized();
  }, [user.locality, user.income, user.caste, user.interest]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const verifiedDocs = user.verifiedDocuments || {};
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocId) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const newDoc: VerifiedDocument = {
        dataUrl,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
      };
      
      const updatedVerifiedDocs = { ...verifiedDocs, [activeDocId]: newDoc };
      updateProfile({ verifiedDocuments: updatedVerifiedDocs });
      
      setIsVerifying(true);
      setTimeout(() => {
        const verifiedDoc = { ...newDoc, status: 'verified' as const };
        updateProfile({ 
          verifiedDocuments: { ...updatedVerifiedDocs, [activeDocId]: verifiedDoc },
          points: user.points + 20 
        });
        setIsVerifying(false);
      }, 3000);
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (id: string) => {
    const updatedVerifiedDocs = { ...verifiedDocs };
    delete updatedVerifiedDocs[id];
    updateProfile({ verifiedDocuments: updatedVerifiedDocs });
  };

  const filteredSchemes = filter === 'All' 
    ? SAMPLE_SCHEMES 
    : SAMPLE_SCHEMES.filter(s => s.provider === filter);

  const activeDoc = DOCUMENT_DEFINITIONS.find(d => d.id === activeDocId);
  const activeVerifiedData = activeDocId ? verifiedDocs[activeDocId] : null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 animate-in fade-in duration-700">
      
      {/* Identity Vault Modal */}
      {isChecklistOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
              <div className="p-10 bg-indigo-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">Identity Vault</h3>
                    <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest opacity-80 mt-1">Zero-Knowledge Verification</p>
                  </div>
                </div>
                <button onClick={() => { setIsChecklistOpen(false); setActiveDocId(null); }} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-80 border-r border-slate-100 overflow-y-auto p-6 bg-slate-50/50">
                  {DOCUMENT_DEFINITIONS.map((doc) => {
                    const status = verifiedDocs[doc.id]?.status;
                    const isActive = activeDocId === doc.id;
                    return (
                      <button key={doc.id} onClick={() => setActiveDocId(doc.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left mb-2 ${isActive ? 'bg-white border-indigo-600 shadow-xl' : 'bg-transparent border-transparent hover:bg-white/80'}`}>
                         <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${status === 'verified' ? 'bg-green-100 text-green-600' : isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                               {doc.icon}
                            </div>
                            <div>
                               <h4 className={`font-black text-xs ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>{doc.label}</h4>
                            </div>
                         </div>
                         {status === 'verified' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 p-10 overflow-y-auto bg-white flex flex-col items-center justify-center">
                   {activeDoc ? (
                     <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-6">
                           <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[2rem] border border-indigo-100 shadow-inner">
                              {activeDoc.icon}
                           </div>
                           <div>
                              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{activeDoc.label}</h3>
                              <p className="text-sm text-slate-500 font-medium">{activeDoc.desc}</p>
                           </div>
                        </div>

                        {activeVerifiedData ? (
                          <div className="space-y-6">
                             <div className="relative aspect-[4/3] w-full bg-slate-100 rounded-[2.5rem] overflow-hidden border-2 border-slate-200 shadow-xl">
                                <img src={activeVerifiedData.dataUrl} className="w-full h-full object-cover" alt="Preview" />
                             </div>
                             <div className="flex gap-4">
                                <button onClick={() => removeDocument(activeDoc.id)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black rounded-2xl border border-slate-200 hover:text-red-500 text-xs uppercase tracking-widest">
                                   <Trash2 className="w-4 h-4 mx-auto" /> Reset
                                </button>
                                {activeVerifiedData.status === 'verified' && (
                                  <div className="flex-[2] py-4 bg-green-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest">
                                     <Check className="w-5 h-5" /> Verified
                                  </div>
                                )}
                             </div>
                          </div>
                        ) : (
                          <div onClick={() => fileInputRef.current?.click()} className="aspect-[16/9] border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-200 transition-all group">
                             <Upload className="w-10 h-10 text-slate-300 mb-4 group-hover:scale-110 transition-transform" />
                             <p className="font-black text-slate-400 group-hover:text-indigo-400 transition-colors">Select & Upload Image</p>
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="text-center opacity-40">
                        <FileText className="w-16 h-16 mx-auto mb-4" />
                        <p className="font-black">Select a document type to verify</p>
                     </div>
                   )}
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-4">
             <Star className="w-3 h-3 fill-indigo-600" /> Scholarship Hub
          </div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Available Schemes</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Opportunities matching your socioeconomic profile.</p>
        </div>

        <div className="flex items-center gap-4 relative" ref={filterRef}>
           <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm font-black text-xs uppercase tracking-widest text-slate-700 min-w-[180px] justify-between transition-all hover:border-indigo-200">
              <div className="flex items-center gap-3"><Filter className="w-4 h-4 text-indigo-500" /> {filter}</div>
              <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
           </button>

           {isFilterOpen && (
             <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-3xl shadow-xl border border-slate-100 p-2 z-30">
                {['All', 'Government', 'Private'].map(option => (
                  <button key={option} onClick={() => { setFilter(option); setIsFilterOpen(false); }} className={`w-full text-left px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${filter === option ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {option}
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* AI Personalized Section */}
      {(user.locality || user.income || user.caste) && (
        <section className="mb-16 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
           <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
              <Sparkles className="w-96 h-96" />
           </div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tight">AI Recommended For You</h2>
              </div>
              
              {loadingAi ? (
                <div className="py-20 flex flex-col items-center justify-center">
                   <Loader2 className="w-10 h-10 animate-spin text-white mb-4" />
                   <p className="font-black text-xs uppercase tracking-widest text-indigo-200">Matching with your profile...</p>
                </div>
              ) : aiSchemes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {aiSchemes.map((rec, i) => (
                     <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:bg-white/20 transition-all border border-transparent hover:border-white/40">
                        <div>
                           <div className="flex justify-between items-start mb-4">
                              <span className="bg-white text-indigo-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">AI Top Match</span>
                              <Wallet className="w-5 h-5 text-indigo-200" />
                           </div>
                           <h3 className="text-xl font-black mb-2">{rec.title}</h3>
                           <p className="text-sm text-indigo-100/70 font-medium leading-relaxed mb-6">{rec.description}</p>
                        </div>
                        <div className="flex gap-4">
                           <a 
                             href="https://scholarships.gov.in" 
                             target="_blank" 
                             rel="noopener noreferrer"
                             aria-label={`Apply for ${rec.title}`}
                             className="flex-1 py-4 bg-white text-indigo-700 font-black rounded-xl text-center text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2"
                           >
                             Apply Now <ArrowUpRight className="w-4 h-4" />
                           </a>
                           <a 
                             href="https://scholarships.gov.in" 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="px-6 py-4 bg-white/10 text-white border border-white/20 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
                           >
                             Details
                           </a>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-10 opacity-60">
                   <p className="text-sm font-medium">No direct AI matches found for your current profile. Try adding more details.</p>
                </div>
              )}
           </div>
        </section>
      )}

      {/* Main List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
           <div className="sticky top-28 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Verification Status
                 </h3>
                 <div className="space-y-4">
                    {DOCUMENT_DEFINITIONS.slice(0, 4).map(doc => (
                       <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-xs font-black text-slate-600">{doc.label}</span>
                          {verifiedDocs[doc.id]?.status === 'verified' ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300" />
                          )}
                       </div>
                    ))}
                 </div>
                 <button onClick={() => setIsChecklistOpen(true)} className="w-full mt-6 py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    Upload & Verify Documents
                 </button>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem]">
                 <div className="flex items-center gap-3 mb-4">
                    <Info className="w-5 h-5 text-amber-600" />
                    <h4 className="font-black text-amber-900 text-sm">Eligibility Note</h4>
                 </div>
                 <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Please ensure your income and caste documents are valid for the current financial year to avoid rejection in government portals.
                 </p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           {filteredSchemes.map((scheme) => {
             const title = typeof scheme.title === 'string' ? scheme.title : (scheme.title[lang] || scheme.title['en']);
             const benefits = typeof scheme.benefits === 'string' ? scheme.benefits : (scheme.benefits[lang] || scheme.benefits['en']);
             const eligibility = Array.isArray(scheme.eligibility) ? scheme.eligibility : (scheme.eligibility[lang] || scheme.eligibility['en']);
             
             return (
               <div key={scheme.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group border-transparent hover:border-indigo-100">
                 <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex-1 space-y-6">
                       <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${scheme.provider === 'Government' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                             {scheme.provider} SCHEME
                          </span>
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-2 group-hover:text-indigo-600 transition-colors">{title}</h3>
                          <p className="text-slate-500 font-medium text-sm leading-relaxed">{benefits}</p>
                       </div>
                       <div className="flex flex-wrap gap-2 pt-2">
                          {eligibility.map((el, idx) => (
                            <span key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">
                               <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {el}
                            </span>
                          ))}
                       </div>
                    </div>
                    <div className="md:w-64 flex flex-col gap-4 shrink-0 justify-center">
                       <a 
                         href={scheme.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         aria-label={`Official application portal for ${title}`}
                         className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] transition-all text-xs uppercase tracking-widest group/btn"
                       >
                         Apply Now <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                       </a>
                       <a 
                         href={scheme.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="w-full py-5 bg-slate-50 text-slate-600 font-black rounded-2xl border border-slate-200 flex items-center justify-center gap-2 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all text-xs uppercase tracking-widest"
                       >
                         Learn More
                       </a>
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

export default Dashboard;
