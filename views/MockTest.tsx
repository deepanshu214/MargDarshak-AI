import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, CheckCircle, Clock, ArrowRight, ArrowLeft, BrainCircuit, Target, 
  Zap, School, GraduationCap, XCircle, Loader2, Sparkles, RotateCcw, 
  History, Bookmark, Flag, ChevronRight, BookOpen, AlertTriangle, 
  HelpCircle, Award, Languages
} from 'lucide-react';
import { MOCK_TEST_QUESTIONS, SCHOOL_STREAMS, COLLEGE_FIELDS } from '../constants';
import { UserProfile, Question, TestAttempt } from '../types';
import { getDetailedAnalysis, getImprovementResources } from '../services/geminiService';
import { databaseService } from '../services/databaseService';
import { storageService } from '../services/storageService';

const ACTIVE_TEST_STORAGE_KEY = "margdarshak_active_test_session";

interface MockTestProps {
  user: UserProfile;
  updateProfile: (u: Partial<UserProfile>) => void;
  strings: Record<string, string>;
}

const MockTest: React.FC<MockTestProps> = ({ user, updateProfile, strings }) => {
  const [step, setStep] = useState<'setup' | 'test' | 'results'>('setup');
  const [educationLevel, setEducationLevel] = useState<'School' | 'College'>(user.educationLevel || 'School');
  const [fieldOfStudy, setFieldOfStudy] = useState<string>(user.fieldOfStudy || '');
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Record<number, TestAttempt>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes default
  const [testLang, setTestLang] = useState<string>(user.language || 'en');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
  const [recommendedResources, setRecommendedResources] = useState<any[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [computedPercentile, setComputedPercentile] = useState<number>(85);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Check if there is an existing in-progress session to recover
    const saved = storageService.getSync<any>(ACTIVE_TEST_STORAGE_KEY);
    if (saved && saved.sessionQuestions?.length > 0 && saved.timeLeft > 0) {
      setSessionQuestions(saved.sessionQuestions);
      setAttempts(saved.attempts || {});
      setMarkedForReview(new Set(saved.markedForReview || []));
      setTimeLeft(saved.timeLeft);
      setFieldOfStudy(saved.fieldOfStudy);
      setEducationLevel(saved.educationLevel);
      setStep('test');
      startTimer();
    }
  }, []);

  const shuffle = (array: any[]) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { 
          clearInterval(timerRef.current); 
          handleFinish(); 
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartTest = () => {
    if (!fieldOfStudy) {
      alert("Please choose a stream or field of study to begin.");
      return;
    }

    const answeredIds = new Set(user.answeredQuestionIds || []);
    
    // Pool for Aptitude (10 questions)
    const aptitudePool = shuffle(MOCK_TEST_QUESTIONS.filter(q => 
      q.subject === 'Aptitude' && !answeredIds.has(q.id)
    ));

    // Pool for Subject (20 questions)
    const subjectPool = MOCK_TEST_QUESTIONS.filter(q =>
      q.subject === fieldOfStudy && 
      (q.audience === 'Both' || q.audience === educationLevel) &&
      !answeredIds.has(q.id)
    );

    const theoreticalSubject = shuffle(subjectPool.filter(q => q.type === 'theoretical'));
    const solvingSubject = shuffle(subjectPool.filter(q => q.type === 'solving'));

    const selectedAptitude = aptitudePool.slice(0, 10);
    const selectedTheoretical = theoreticalSubject.slice(0, 10);
    const selectedSolving = solvingSubject.slice(0, 10);

    const selectedSubject = [...selectedTheoretical, ...selectedSolving];
    
    if (selectedSubject.length < 20) {
      const remainingPool = shuffle(subjectPool.filter(q => !selectedSubject.find(s => s.id === q.id)));
      selectedSubject.push(...remainingPool.slice(0, 20 - selectedSubject.length));
    }

    let finalSession = shuffle([...selectedAptitude, ...selectedSubject]);

    if (finalSession.length === 0) {
      finalSession = shuffle(MOCK_TEST_QUESTIONS.filter(q => q.subject === fieldOfStudy || q.subject === 'Aptitude')).slice(0, 30);
    }

    setSessionQuestions(finalSession);
    setAttempts({});
    setMarkedForReview(new Set());
    setCurrentIdx(0);
    setTimeLeft(1800); 
    setStep('test');
    startTimer();

    // Cache active session
    storageService.set(ACTIVE_TEST_STORAGE_KEY, {
      sessionQuestions: finalSession,
      attempts: {},
      markedForReview: [],
      timeLeft: 1800,
      fieldOfStudy,
      educationLevel
    }).catch(() => {});
  };

  const selectOption = (optionIdx: number) => {
    const q = sessionQuestions[currentIdx];
    if (!q) return;

    const newAttempts = {
      ...attempts,
      [q.id]: {
        questionId: q.id,
        chosenOptionIdx: optionIdx,
        correctAnswerIdx: q.correctAnswerIdx,
        isCorrect: optionIdx === q.correctAnswerIdx,
        subject: q.subject
      }
    };
    setAttempts(newAttempts);

    // Auto-save progress
    storageService.set(ACTIVE_TEST_STORAGE_KEY, {
      sessionQuestions,
      attempts: newAttempts,
      markedForReview: Array.from(markedForReview),
      timeLeft,
      fieldOfStudy,
      educationLevel
    }).catch(() => {});
  };

  const toggleReviewMark = (questionId: number) => {
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleFinish = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowSubmitModal(false);
    storageService.remove(ACTIVE_TEST_STORAGE_KEY).catch(() => {});
    setStep('results');

    const results = Object.values(attempts);
    const correctCount = results.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctCount / (sessionQuestions.length || 1)) * 100);
    const earnedPoints = correctCount * 10 + 50;
    
    const breakdown = {
      subjectCorrect: results.filter(r => r.subject === fieldOfStudy && r.isCorrect).length,
      subjectTotal: results.filter(r => r.subject === fieldOfStudy).length,
      logicalCorrect: results.filter(r => r.subject === 'Aptitude' && r.isCorrect).length,
      logicalTotal: results.filter(r => r.subject === 'Aptitude').length
    };

    // Compute percentile against all stored users
    const allUsers = databaseService.getAllUsers();
    let lowerCount = 0;
    const currentScore = correctCount * 10;
    for (const u of allUsers) {
      if ((u.points || 0) <= (user.points + earnedPoints)) {
        lowerCount++;
      }
    }
    const totalBenchmark = Math.max(1, allUsers.length);
    const percentile = Math.min(99, Math.max(10, Math.round((lowerCount / totalBenchmark) * 100)));
    setComputedPercentile(percentile);

    setIsLoadingFeedback(true);
    const [analysis, resources] = await Promise.all([
      getDetailedAnalysis(fieldOfStudy, accuracy, breakdown, testLang),
      getImprovementResources(fieldOfStudy, accuracy, testLang)
    ]);
    
    setDetailedAnalysis(analysis);
    setRecommendedResources(resources);
    
    const globallyAnswered = new Set(user.answeredQuestionIds || []);
    results.forEach(a => globallyAnswered.add(a.questionId));

    updateProfile({ 
      points: (user.points || 0) + earnedPoints, 
      answeredQuestionIds: Array.from(globallyAnswered),
      testHistory: [{ 
        id: Math.random().toString(36).substr(2, 9), 
        date: new Date().toISOString(), 
        field: fieldOfStudy, 
        score: currentScore, 
        accuracy, 
        totalQuestions: sessionQuestions.length, 
        breakdown,
        analysis,
        resources,
        attempts: results 
      }, ...(user.testHistory || [])]
    });
    
    setIsLoadingFeedback(false);
  };

  // STEP 1: SETUP SCREEN
  if (step === 'setup') {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[80vh] animate-in zoom-in-95 space-y-10">
        <div className="bg-white p-8 sm:p-14 rounded-3xl shadow-xl border border-slate-100 text-center w-full">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-3">
            National Talent Evaluation & Mock Assessment
          </h1>
          <p className="text-slate-500 font-bold text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
            30 Timed Questions (10 Aptitude + 20 Subject Specific) • 30 Minutes • Live AI Analysis & Scholarship Matching
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
            <button 
              onClick={() => { setEducationLevel('School'); setFieldOfStudy(''); }} 
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                educationLevel === 'School' 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-4 ring-indigo-50' 
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <School className="w-8 h-8 text-indigo-600" />
              <span className="font-black text-slate-800 text-base">School Level (Class 9 - 12)</span>
            </button>
            <button 
              onClick={() => { setEducationLevel('College'); setFieldOfStudy(''); }} 
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                educationLevel === 'College' 
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-4 ring-indigo-50' 
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <span className="font-black text-slate-800 text-base">College & Degree Level</span>
            </button>
          </div>

          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">
            Select Your Subject Stream / Domain
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10 max-w-3xl mx-auto">
            {(educationLevel === 'School' ? SCHOOL_STREAMS : COLLEGE_FIELDS).map(f => (
              <button 
                key={f} 
                onClick={() => setFieldOfStudy(f)} 
                className={`px-4 py-3.5 rounded-xl font-bold text-xs text-center border-2 transition-all ${
                  fieldOfStudy === f 
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' 
                    : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button 
            disabled={!fieldOfStudy}
            onClick={handleStartTest} 
            className={`w-full max-w-md py-4 px-8 rounded-2xl font-black text-base transition-all shadow-xl ${
              fieldOfStudy 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Start Assessment Now
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: TEST RUNNING SCREEN
  const currentQ = sessionQuestions[currentIdx];
  const currentAttempt = currentQ ? attempts[currentQ.id] : null;
  const isMarked = currentQ ? markedForReview.has(currentQ.id) : false;
  const answeredCount = Object.keys(attempts).length;

  if (step === 'test' && currentQ) {
    const qText = currentQ.text[testLang] || currentQ.text['en'] || currentQ.text['hi'];
    const options = currentQ.options[testLang] || currentQ.options['en'] || currentQ.options['hi'] || [];

    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-16 space-y-6 animate-in fade-in duration-300">
        
        {/* Test Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="bg-indigo-50 text-indigo-700 font-black text-xs px-3 py-1.5 rounded-xl">
              {currentQ.subject}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Question {currentIdx + 1} of {sessionQuestions.length}
            </span>
          </div>

          {/* Center Timer */}
          <div className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-black text-sm tracking-wider ${
            timeLeft < 300 
              ? 'bg-rose-50 text-rose-600 animate-pulse border border-rose-200' 
              : 'bg-slate-50 text-slate-700 border border-slate-100'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>

          {/* Right Language & Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTestLang(prev => prev === 'hi' ? 'en' : 'hi')} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              title="Toggle Hindi/English"
            >
              <Languages className="w-3.5 h-3.5 text-indigo-600" />
              {testLang === 'hi' ? 'English' : 'हिन्दी'}
            </button>
            <button 
              onClick={() => setShowSubmitModal(true)} 
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
            >
              Submit Test
            </button>
          </div>
        </div>

        {/* Question Area & Question Drawer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Question Card */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Q{currentIdx + 1} • {currentQ.type === 'solving' ? 'Numerical / Problem Solving' : 'Concept / Theory'}
                </span>
                <button 
                  onClick={() => toggleReviewMark(currentQ.id)} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isMarked 
                      ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                      : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isMarked ? 'Marked for Review' : 'Mark for Review'}
                </button>
              </div>

              {/* Question Text */}
              <h2 className="text-lg sm:text-xl font-black text-slate-800 leading-relaxed mb-8">
                {qText}
              </h2>

              {/* Options */}
              <div className="space-y-3.5 mb-8">
                {options.map((opt: string, oIdx: number) => {
                  const isSelected = currentAttempt?.chosenOptionIdx === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => selectOption(oIdx)}
                      className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-sm' 
                          : 'border-slate-100 bg-white hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Bottom Controls */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${
                  currentIdx === 0 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs font-bold text-slate-400">
                {answeredCount} of {sessionQuestions.length} Answered
              </span>

              {currentIdx < sessionQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Review & Submit <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Question Palette / Drawer */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">
                Question Palette
              </h3>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {sessionQuestions.map((q, idx) => {
                  const hasAnswered = !!attempts[q.id];
                  const isRev = markedForReview.has(q.id);
                  const isCurrent = idx === currentIdx;

                  let colorClass = 'bg-slate-100 text-slate-500';
                  if (hasAnswered) colorClass = 'bg-emerald-600 text-white';
                  if (isRev) colorClass = 'bg-amber-500 text-white';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-xl font-black text-xs transition-all ${colorClass} ${
                        isCurrent ? 'ring-4 ring-indigo-400/50 scale-105' : 'hover:opacity-80'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-600"></div>
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500"></div>
                  <span>Marked for Review ({markedForReview.size})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-slate-200"></div>
                  <span>Unanswered ({sessionQuestions.length - answeredCount})</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-md transition-colors"
            >
              End Assessment
            </button>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Submit Assessment?</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  You have answered <span className="text-indigo-600">{answeredCount}</span> of <span className="text-indigo-600">{sessionQuestions.length}</span> questions.
                  {markedForReview.size > 0 && ` (${markedForReview.size} questions still marked for review)`}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50"
                >
                  Continue Testing
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md"
                >
                  Yes, Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STEP 3: RESULTS SCREEN
  const lastTest = user.testHistory?.[0];
  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
      
      {/* Result Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-amber-300">
              Assessment Completed
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">{fieldOfStudy} Evaluation</h2>
            <p className="text-indigo-200 font-bold text-xs sm:text-sm mt-1">
              {new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Accuracy</p>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">{lastTest?.accuracy || 0}%</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">National Percentile</p>
              <p className="text-3xl sm:text-4xl font-black text-amber-300 mt-1">Top {100 - computedPercentile}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
          <p className="text-xs font-black uppercase text-slate-400">Total Score</p>
          <p className="text-3xl font-black text-indigo-600 mt-2">{lastTest?.score || 0} Pts</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
          <p className="text-xs font-black uppercase text-slate-400">Subject Knowledge</p>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {lastTest?.breakdown.subjectCorrect || 0}/{lastTest?.breakdown.subjectTotal || 0}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
          <p className="text-xs font-black uppercase text-slate-400">Logical Aptitude</p>
          <p className="text-3xl font-black text-slate-800 mt-2">
            {lastTest?.breakdown.logicalCorrect || 0}/{lastTest?.breakdown.logicalTotal || 0}
          </p>
        </div>
      </div>

      {/* AI Diagnostics */}
      {isLoadingFeedback ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-black text-slate-700">MargDarshak AI is evaluating your performance insights...</p>
        </div>
      ) : detailedAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600" /> AI Diagnostic Analysis
            </h4>
            <div className="space-y-4">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-2">Strengths</p>
                <ul className="space-y-1 text-xs font-bold text-slate-700">
                  {detailedAnalysis.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-700 mb-2">Areas for Improvement</p>
                <ul className="space-y-1 text-xs font-bold text-slate-700">
                  {detailedAnalysis.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700">
                <p className="font-black text-indigo-700 uppercase text-[10px] mb-1">Career Fit Assessment</p>
                <p className="font-bold italic">"{detailedAnalysis.careerFit}"</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Curated Free Learning Resources
              </h4>
              <div className="space-y-3">
                {recommendedResources.map((res: any, idx: number) => (
                  <a 
                    key={idx}
                    href={res.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-slate-50 flex items-center justify-between transition-all block"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-800">{res.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{res.description}</p>
                    </div>
                    <span className="text-indigo-600 text-xs font-bold shrink-0 ml-3">Explore →</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => setStep('setup')}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Take Another Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTest;
