import React, { useState } from 'react';
import { 
  User, MapPin, Shield, CheckCircle2, X, FileCheck, Heart, Wallet, 
  BookOpen, TrendingUp, Award, BrainCircuit, CheckCircle, XCircle, 
  ChevronDown, Youtube, Book, Globe, ExternalLink, History, UploadCloud, 
  FileText, Sparkles, Loader2, AlertCircle, Eye, RefreshCw, Check
} from 'lucide-react';
import { UserProfile, TestRecord, VerifiedDocument } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_TEST_QUESTIONS } from '../constants';
import { verifyDocumentMultimodal } from '../services/geminiService';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi NCR"
];

const INCOME_SLABS = [
  "Below ₹1,00,000 / year (BPL / Antyodaya)",
  "₹1,00,000 - ₹2,50,000 / year (Low Income)",
  "₹2,50,000 - ₹5,00,000 / year (Moderate)",
  "₹5,00,000 - ₹8,00,000 / year (EWS Upper Ceiling)",
  "Above ₹8,00,000 / year"
];

const CASTE_CATEGORIES = [
  "General",
  "OBC (Non-Creamy Layer)",
  "SC (Scheduled Caste)",
  "ST (Scheduled Tribe)",
  "EWS (Economically Weaker Section)",
  "Minority Community"
];

interface ProfileProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  updateProfile: (u: Partial<UserProfile>) => void;
  strings: Record<string, string>;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser, updateProfile, strings }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'history'>('details');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [showAnswerKeyId, setShowAnswerKeyId] = useState<string | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState<string | null>(null);
  const [docUploadFeedback, setDocUploadFeedback] = useState<string | null>(null);

  // Compute live trust score based on verification and profile completeness
  const computeTrustScore = (u: UserProfile): number => {
    let score = 20; // Base score for account
    if (u.name && u.email) score += 10;
    if (u.locality && u.locality !== '') score += 10;
    if (u.caste && u.income) score += 15;
    if (u.educationLevel && u.fieldOfStudy) score += 10;

    const docs = u.verifiedDocuments || {};
    if (docs.aadhaar?.status === 'verified') score += 15;
    if (docs.income?.status === 'verified') score += 10;
    if (docs.caste?.status === 'verified') score += 5;
    if (docs.marksheet?.status === 'verified') score += 5;

    return Math.min(100, score);
  };

  const trustScore = computeTrustScore(user);

  const handleSave = () => {
    const updated = {
      ...formData,
      trustScore: computeTrustScore(formData)
    };
    updateProfile(updated);
    setIsEditing(false);
  };

  // Handle document upload and AI Vision verification
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'aadhaar' | 'income' | 'caste' | 'marksheet') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB image)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB. Please upload a smaller compressed image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setIsAnalyzingDoc(docType);
      setDocUploadFeedback(`AI Vision is analyzing your ${docType.toUpperCase()} document...`);

      // 1. Initial pending save
      const initialDoc: VerifiedDocument = {
        dataUrl,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        documentType: docType
      };

      const updatedDocs = {
        ...(user.verifiedDocuments || {}),
        [docType]: initialDoc
      };
      updateProfile({ verifiedDocuments: updatedDocs });

      // 2. Multimodal AI Analysis
      try {
        const result = await verifyDocumentMultimodal(dataUrl, docType, user);
        
        const finalizedDoc: VerifiedDocument = {
          dataUrl,
          status: result.status,
          uploadedAt: new Date().toISOString(),
          documentType: docType,
          extractedDetails: result.extractedDetails,
          aiConfidenceScore: result.confidenceScore,
          verificationMessage: result.message
        };

        const finalDocs = {
          ...(user.verifiedDocuments || {}),
          [docType]: finalizedDoc
        };

        const newScore = computeTrustScore({ ...user, verifiedDocuments: finalDocs });
        updateProfile({
          verifiedDocuments: finalDocs,
          trustScore: newScore,
          isVerified: newScore >= 70
        });

        setDocUploadFeedback(result.message);
      } catch (err) {
        console.error("Verification failed:", err);
        setDocUploadFeedback("Verification completed with manual fallback.");
      } finally {
        setIsAnalyzingDoc(null);
        setTimeout(() => setDocUploadFeedback(null), 5000);
      }
    };
    reader.readAsDataURL(file);
  };

  const chartData = (user.testHistory || []).slice().reverse().map(test => ({
    name: new Date(test.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: test.score,
    accuracy: test.accuracy
  }));

  const renderAnswerKey = (test: TestRecord) => {
    if (!test.attempts || test.attempts.length === 0) {
      return <p className="text-slate-400 font-bold italic p-6">No answer key data available for this session.</p>;
    }

    return (
      <div className="space-y-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-inner max-h-[500px] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-5 h-5 text-indigo-600" />
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Review Answer Key</h4>
        </div>
        {test.attempts.map((attempt, idx) => {
          const q = MOCK_TEST_QUESTIONS.find(question => question.id === attempt.questionId);
          if (!q) return null;
          const lang = user.language || 'en';
          const options = q.options[lang] || q.options['en'];
          const questionText = q.text[lang] || q.text['en'];

          return (
            <div key={idx} className={`p-5 rounded-2xl border-2 transition-all ${attempt.isCorrect ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}>
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-bold text-slate-800 leading-relaxed pr-4">{idx + 1}. {questionText}</p>
                {attempt.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Your Answer</p>
                  <p className={`text-xs font-black ${attempt.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
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

  const documentSlots: { id: 'aadhaar' | 'income' | 'caste' | 'marksheet'; label: string; desc: string }[] = [
    { id: 'aadhaar', label: 'Aadhaar / National ID', desc: 'Government photo identification proof for student identity verification.' },
    { id: 'income', label: 'Income Certificate', desc: 'Tehsildar / Revenue Department issued family annual income certificate.' },
    { id: 'caste', label: 'Caste / Community Certificate', desc: 'Official SC / ST / OBC / EWS category verification certificate.' },
    { id: 'marksheet', label: 'Latest Marksheet / Report Card', desc: 'Class 10th/12th or Semester grade sheet demonstrating academic merit.' }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto pb-20 space-y-10 animate-in fade-in duration-500">
      
      {/* Profile Header Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
          <div className="h-44 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute top-4 right-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {user.locality || "National Scholar"}
            </div>
          </div>
          <div className="px-8 pb-8 -mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
                <div className="w-32 h-32 rounded-3xl bg-white p-2.5 shadow-2xl ring-8 ring-indigo-50 shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <User className="w-16 h-16" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                    {user.educationLevel || 'Student'} • {user.fieldOfStudy || 'General'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                    <span className="bg-indigo-50 text-indigo-700 text-[11px] font-black px-3 py-0.5 rounded-full">
                      {user.points || 0} XP Points
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] font-black px-3 py-0.5 rounded-full">
                      {user.badges?.length || 0} Badges Earned
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                className={`px-8 py-3.5 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 text-sm ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Trust Score & Verification Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-800 flex items-center gap-2.5 text-base">
                <Shield className="w-5 h-5 text-indigo-600" /> MargDarshak Trust Index
              </h3>
              <span className={`text-2xl font-black ${trustScore >= 80 ? 'text-emerald-600' : trustScore >= 50 ? 'text-indigo-600' : 'text-amber-500'}`}>
                {trustScore}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6">
              <div 
                className={`h-full transition-all duration-700 ${trustScore >= 80 ? 'bg-emerald-500' : trustScore >= 50 ? 'bg-indigo-600' : 'bg-amber-500'}`} 
                style={{ width: `${trustScore}%` }}
              ></div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> State & Domicile</span>
                {user.locality ? <Check className="w-4 h-4 text-emerald-500" /> : <span className="text-amber-500 text-[10px]">Pending</span>}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2"><Wallet className="w-3.5 h-3.5 text-indigo-500" /> Income & Caste Declared</span>
                {user.caste && user.income ? <Check className="w-4 h-4 text-emerald-500" /> : <span className="text-amber-500 text-[10px]">Pending</span>}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2"><FileCheck className="w-3.5 h-3.5 text-indigo-500" /> AI Document Verification</span>
                {Object.values(user.verifiedDocuments || {}).some(d => d.status === 'verified') ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className="text-amber-500 text-[10px]">Upload Docs</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tier Status</span>
            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              {trustScore >= 80 ? "Platinum Verified" : trustScore >= 50 ? "Gold Scholar" : "Silver Aspirant"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 sm:gap-8 border-b border-slate-200 overflow-x-auto pb-1">
        <button 
          onClick={() => setActiveTab('details')} 
          className={`pb-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all relative shrink-0 ${activeTab === 'details' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Profile & Eligibility
          {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('documents')} 
          className={`pb-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all relative shrink-0 ${activeTab === 'documents' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          AI Document Verification Hub
          {activeTab === 'documents' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`pb-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all relative shrink-0 ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Assessment & Growth
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></div>}
        </button>
      </div>

      {/* Tab 1: Profile & Eligibility */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-3 duration-400">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Academic & Personal Information
            </h3>
            <div className="space-y-6">
              <ProfileField label="Full Name" value={formData.name} isEditing={isEditing} onChange={(v: string) => setFormData({...formData, name: v})} />
              <ProfileField label="Email Address" value={formData.email} isEditing={false} />
              <ProfileField 
                label="Education Level" 
                value={formData.educationLevel || 'School'} 
                isEditing={isEditing} 
                type="select" 
                options={['School', 'College']} 
                onChange={(v: string) => setFormData({...formData, educationLevel: v as any})} 
              />
              <ProfileField 
                label="Stream / Target Domain" 
                value={formData.fieldOfStudy || ''} 
                isEditing={isEditing} 
                onChange={(v: string) => setFormData({...formData, fieldOfStudy: v})} 
              />
            </div>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-600" /> Socio-Economic & Scholarship Criteria
            </h3>
            <div className="space-y-6">
              <ProfileField 
                label="Domicile State / Region" 
                value={formData.locality || ''} 
                isEditing={isEditing} 
                type="select" 
                options={INDIAN_STATES} 
                onChange={(v: string) => setFormData({...formData, locality: v})} 
              />
              <ProfileField 
                label="Social Category / Caste" 
                value={formData.caste || ''} 
                isEditing={isEditing} 
                type="select" 
                options={CASTE_CATEGORIES} 
                onChange={(v: string) => setFormData({...formData, caste: v})} 
              />
              <ProfileField 
                label="Family Annual Income Tier" 
                value={formData.income || ''} 
                isEditing={isEditing} 
                type="select" 
                options={INCOME_SLABS} 
                onChange={(v: string) => setFormData({...formData, income: v})} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Document Verification Hub */}
      {activeTab === 'documents' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-3 duration-400">
          <div className="bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-6 sm:p-8 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Multimodal AI Document Verification
              </h3>
              <p className="text-xs font-bold text-slate-500 max-w-2xl leading-relaxed">
                Upload your certificates or IDs. MargDarshak uses Google Gemini Vision to verify certificate legitimacy, extract income cutoffs, validate student names, and auto-qualify you for central NSP & CSR scholarships.
              </p>
            </div>
            {docUploadFeedback && (
              <div className="bg-indigo-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-in fade-in">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                {docUploadFeedback}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentSlots.map((slot) => {
              const doc = user.verifiedDocuments?.[slot.id];
              const isVerifyingThis = isAnalyzingDoc === slot.id;

              return (
                <div key={slot.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-base font-black text-slate-800">{slot.label}</h4>
                        <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">{slot.desc}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        doc?.status === 'verified' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : doc?.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {doc?.status === 'verified' ? 'Verified' : doc?.status === 'pending' ? 'In Review' : 'Not Uploaded'}
                      </span>
                    </div>

                    {/* Extracted Details Pill */}
                    {doc?.extractedDetails && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">AI Confidence:</span>
                          <span className="font-black text-indigo-600">{doc.aiConfidenceScore || 85}%</span>
                        </div>
                        {doc.extractedDetails.issuingState && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold uppercase text-[9px]">Issuing Authority:</span>
                            <span className="font-black text-slate-700">{doc.extractedDetails.issuingState}</span>
                          </div>
                        )}
                        {doc.verificationMessage && (
                          <p className="text-[11px] font-bold text-emerald-700 mt-1">{doc.verificationMessage}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
                    <label className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs cursor-pointer transition-all ${
                      isVerifyingThis 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95'
                    }`}>
                      {isVerifyingThis ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          {doc ? 'Re-upload & Verify' : 'Upload & Verify with AI'}
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        disabled={isVerifyingThis}
                        onChange={(e) => handleFileUpload(e, slot.id)} 
                        className="hidden" 
                      />
                    </label>

                    {doc?.dataUrl && (
                      <a 
                        href={doc.dataUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Assessment & Growth History */}
      {activeTab === 'history' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-3 duration-400">
          {chartData.length > 0 ? (
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Academic Progression Tracking</h3>
                  <p className="text-xs font-bold text-slate-400">Accuracy & Score trajectories across test sessions</p>
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
            <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-black uppercase tracking-wider text-xs">No Assessment History Recorded</p>
              <p className="text-xs font-bold text-slate-400 mt-1">Take a talent evaluation test to start tracking your progress!</p>
            </div>
          )}

          {/* Test History List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-base">Evaluations Taken</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">
                {user.testHistory?.length || 0} Total Tests
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {(user.testHistory || []).map((test, idx) => (
                <div key={test.id || idx} className="group">
                  <div className="w-full p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between hover:bg-slate-50/50 transition-all text-left">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform shrink-0">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-800">{test.field}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {new Date(test.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 md:gap-8 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Breakdown</p>
                        <p className="text-xs font-black text-slate-600">S: {test.breakdown?.subjectCorrect}/{test.breakdown?.subjectTotal} • L: {test.breakdown?.logicalCorrect}/{test.breakdown?.logicalTotal}</p>
                      </div>
                      <div className="text-right w-20">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Accuracy</p>
                        <p className="text-xl font-black text-emerald-600">{test.accuracy}%</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowAnswerKeyId(showAnswerKeyId === test.id ? null : test.id)}
                          className={`p-2.5 rounded-xl border transition-all ${showAnswerKeyId === test.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600'}`}
                          title="View Answer Key"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setExpandedTestId(expandedTestId === test.id ? null : test.id)}
                          className={`p-2.5 rounded-xl border transition-all ${expandedTestId === test.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600'}`}
                          title="Detailed Analysis"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${expandedTestId === test.id ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {showAnswerKeyId === test.id && (
                    <div className="p-6 sm:p-8 bg-slate-50/60 border-t border-slate-100">
                      {renderAnswerKey(test)}
                    </div>
                  )}

                  {expandedTestId === test.id && (
                    <div className="p-6 sm:p-8 bg-indigo-50/30 border-t border-slate-100">
                      {test.analysis ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div>
                              <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> AI Diagnostic Insights</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Strengths</p>
                                  <ul className="space-y-1.5">
                                    {test.analysis.strengths.map((s, i) => (
                                      <li key={i} className="text-xs font-bold text-slate-700 flex gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {s}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Weaknesses</p>
                                  <ul className="space-y-1.5">
                                    {test.analysis.weaknesses.map((w, i) => (
                                      <li key={i} className="text-xs font-bold text-slate-700 flex gap-2"><XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {w}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm">
                              <p className="text-[9px] font-black text-indigo-600 uppercase mb-1.5">Career Suitability</p>
                              <p className="text-xs font-bold text-slate-700 italic">"{test.analysis.careerFit}"</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Recommended Free Resources</h5>
                            <div className="space-y-3">
                              {(test.resources || []).map((res, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl border border-indigo-100 flex justify-between items-center hover:border-indigo-400 transition-all">
                                  <div>
                                    <p className="text-xs font-black text-slate-800">{res.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{res.description}</p>
                                  </div>
                                  <a href={res.link} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shrink-0">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400 font-bold text-xs text-center">No detailed analysis available for this session.</p>
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

const ProfileField = ({ label, value, isEditing, onChange, type = "text", options }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    {isEditing ? (
      type === 'select' ? (
        <select 
          value={value} 
          onChange={(e) => onChange?.(e.target.value)} 
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 font-bold text-xs focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
        >
          <option value="">Select an option</option>
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange?.(e.target.value)} 
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 font-bold text-xs focus:border-indigo-500 focus:bg-white outline-none transition-all" 
        />
      )
    ) : (
      <div className="py-2">
        <p className="font-bold text-sm text-slate-800">{value || <span className="text-slate-300 font-normal italic">Not provided</span>}</p>
      </div>
    )}
  </div>
);

export default Profile;
