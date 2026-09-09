import React, { useState, useEffect } from 'react';
import { 
  Filter, ExternalLink, CheckCircle2, ChevronDown, X, FileText, 
  ShieldCheck, Banknote, MapPin, GraduationCap, UserCheck, Upload, 
  Loader2, Check, Sparkles, Star, ArrowUpRight, Wallet, Info, 
  Search, Bookmark, BookmarkCheck, Calendar, Clock, AlertCircle, 
  Award, Eye, Share2
} from 'lucide-react';
import { UserProfile, VerifiedDocument } from '../types';
import { scholarshipService, SchemeDefinition, COMPREHENSIVE_SCHEMES } from '../services/scholarshipService';
import { getSmartRecommendations } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  updateProfile: (u: Partial<UserProfile>) => void;
  strings: Record<string, string>;
}

const Dashboard: React.FC<DashboardProps> = ({ user, updateProfile, strings }) => {
  const [filter, setFilter] = useState<'All' | 'Central Govt' | 'State Govt' | 'Corporate CSR' | 'Bookmarked'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<(SchemeDefinition & { matchData: any }) | null>(null);
  const [aiSchemes, setAiSchemes] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

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

  const toggleBookmark = (schemeId: string) => {
    const currentBookmarks = new Set(user.bookmarkedSchemes || []);
    if (currentBookmarks.has(schemeId)) {
      currentBookmarks.delete(schemeId);
    } else {
      currentBookmarks.add(schemeId);
    }
    updateProfile({ bookmarkedSchemes: Array.from(currentBookmarks) });
  };

  const updateApplicationStatus = (schemeId: string, schemeName: string, status: any) => {
    const currentApplied = [...(user.appliedSchemes || [])];
    const existingIdx = currentApplied.findIndex(a => a.schemeId === schemeId);

    if (existingIdx >= 0) {
      currentApplied[existingIdx].status = status;
    } else {
      currentApplied.push({
        schemeId,
        schemeName,
        appliedDate: new Date().toISOString(),
        status
      });
    }

    updateProfile({ appliedSchemes: currentApplied });
  };

  const rankedSchemes = scholarshipService.getRankedSchemes(user, filter, searchQuery);
  const bookmarkedSet = new Set(user.bookmarkedSchemes || []);
  const appliedMap = new Map((user.appliedSchemes || []).map(a => [a.schemeId, a.status]));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-24 space-y-10 animate-in fade-in duration-500">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-950">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-amber-300 border border-white/10 mb-3 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Direct Financial Aid & Govt Scheme Discovery
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-serif">
              Verified Scholarships For You
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm font-medium mt-1.5 max-w-xl leading-relaxed">
              Real-time matching across Central NSP, State Departments, and Tata & Reliance Corporate CSR programs.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div>
              <p className="text-[10px] font-black uppercase text-amber-300 tracking-wider font-mono">Your Domicile & Category</p>
              <p className="text-sm font-black text-white">{user.locality || "All India"} • {user.caste || "General"}</p>
              <p className="text-[11px] font-bold text-emerald-300 mt-0.5">
                {rankedSchemes.filter(s => s.matchData.isEligible).length} Highly Eligible Schemes Found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by scholarship, state, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/95 rounded-2xl border border-stone-200 font-bold text-xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {(['All', 'Central Govt', 'State Govt', 'Corporate CSR', 'Bookmarked'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                filter === tab 
                  ? 'bg-emerald-800 text-amber-300 border border-amber-400/40 shadow-sm' 
                  : 'bg-white/90 text-stone-700 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              {tab === 'Bookmarked' ? `★ Saved (${bookmarkedSet.size})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rankedSchemes.map((scheme) => {
          const isSaved = bookmarkedSet.has(scheme.id);
          const currentStatus = appliedMap.get(scheme.id);
          const matchPercent = scheme.matchData.score;
          const title = scheme.title[lang] || scheme.title['en'];
          const benefits = scheme.benefits[lang] || scheme.benefits['en'];

          return (
            <div 
              key={scheme.id}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group hover:border-emerald-300"
            >
              <div>
                {/* Header Tags */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    scheme.providerType === 'Central Govt' 
                      ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                      : scheme.providerType === 'State Govt'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-stone-100 text-stone-700 border border-stone-200'
                  }`}>
                    {scheme.providerType}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                      matchPercent >= 80 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : matchPercent >= 60 
                        ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                        : 'bg-stone-100 text-stone-500'
                    }`}>
                      {matchPercent}% Match
                    </span>
                    <button 
                      onClick={() => toggleBookmark(scheme.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-stone-50 transition-colors"
                      title={isSaved ? "Remove Bookmark" : "Save Scheme"}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Grant Amount Highlight */}
                <div className="mb-3">
                  <p className="text-xs font-black uppercase text-stone-400 tracking-wider font-mono">Financial Grant</p>
                  <p className="text-lg font-black text-emerald-700 tracking-tight">{scheme.amountDisplay}</p>
                </div>

                {/* Scheme Title */}
                <h3 className="text-base font-black text-slate-800 tracking-tight line-clamp-2 group-hover:text-emerald-800 transition-colors mb-2">
                  {title}
                </h3>
                <p className="text-xs font-bold text-stone-400 mb-4">{scheme.provider}</p>

                {/* Eligibility Badges */}
                <div className="space-y-1.5 mb-6 text-[11px] font-bold text-stone-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Region: {scheme.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Income Cap: Up to ₹{(scheme.incomeLimit / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Deadline: {new Date(scheme.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Actions & Tracking Bottom */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-400 font-mono">Application Status:</span>
                  <select
                    value={currentStatus || 'Saved'}
                    onChange={(e) => updateApplicationStatus(scheme.id, title, e.target.value)}
                    className="bg-stone-50 border border-stone-200 text-stone-700 font-bold px-2 py-1 rounded-lg text-xs outline-none cursor-pointer focus:border-emerald-500"
                  >
                    <option value="Saved">📌 Saved</option>
                    <option value="Applied">📤 Applied</option>
                    <option value="Under Review">⏳ Under Review</option>
                    <option value="Disbursed">✅ Disbursed</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors text-center"
                  >
                    View Criteria
                  </button>
                  <a
                    href={scheme.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm border border-amber-400/30 transition-all active:scale-95"
                  >
                    Apply Now <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Scheme Breakdown Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-mono">
                  {selectedScheme.providerType}
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-2 font-serif">
                  {selectedScheme.title[lang] || selectedScheme.title['en']}
                </h2>
                <p className="text-xs font-bold text-stone-400 mt-0.5">{selectedScheme.provider}</p>
              </div>
              <button 
                onClick={() => setSelectedScheme(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Match Analysis */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-700">Profile Match Evaluation</span>
                <span className="text-sm font-black text-emerald-800">{selectedScheme.matchData.score}% Fit</span>
              </div>
              <ul className="space-y-1 text-xs font-bold text-slate-600">
                {selectedScheme.matchData.reasons.map((r: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {r}
                  </li>
                ))}
                {selectedScheme.matchData.missingCriteria.map((m: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents Checklist */}
            <div>
              <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-3 font-mono">
                Required Verification Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedScheme.requiredDocs.map((docId) => {
                  const isVerified = user.verifiedDocuments?.[docId]?.status === 'verified';
                  return (
                    <div key={docId} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-slate-700">
                      <span className="capitalize">{docId.replace('-', ' ')}</span>
                      {isVerified ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-black">
                          <Check className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">Needs Upload</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Portal Apply Button */}
            <div className="pt-4 border-t border-stone-200 flex gap-4">
              <button
                onClick={() => setSelectedScheme(null)}
                className="flex-1 py-3.5 border border-stone-200 text-stone-700 font-bold rounded-xl text-xs hover:bg-stone-50"
              >
                Close
              </button>
              <a
                href={selectedScheme.applicationUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md border border-amber-400/30"
              >
                Go to Official Application Portal <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
