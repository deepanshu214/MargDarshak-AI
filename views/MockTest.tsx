
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, CheckCircle, Clock, ArrowRight, BrainCircuit, Target, Zap, School, GraduationCap, XCircle, Loader2, Sparkles, RotateCcw, History } from 'lucide-react';
import { MOCK_TEST_QUESTIONS, SCHOOL_STREAMS, COLLEGE_FIELDS } from '../constants';
import { UserProfile, Question, TestAttempt } from '../types';
import { getDetailedAnalysis, getImprovementResources } from '../services/geminiService';

const MockTest: React.FC<{ user: UserProfile, updateProfile: (u: Partial<UserProfile>) => void, strings: Record<string, string> }> = ({ user, updateProfile, strings }) => {
  const [step, setStep] = useState<'setup' | 'test' | 'results'>('setup');
  const [educationLevel, setEducationLevel] = useState<'School' | 'College'>(user.educationLevel || 'School');
  const [fieldOfStudy, setFieldOfStudy] = useState<string>('');
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Record<number, TestAttempt>>({});
  const [timeLeft, setTimeLeft] = useState(1800); 
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
  const [recommendedResources, setRecommendedResources] = useState<any[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const timerRef = useRef<any>(null);

  const lang = user.language || 'en';

  useEffect(() => {
    setFieldOfStudy('');
  }, [educationLevel]);

  const shuffle = (array: any[]) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const handleStartTest = () => {
    const answeredIds = new Set(user.answeredQuestionIds || []);
    
    // Pool for Aptitude (10 total)
    const aptitudePool = shuffle(MOCK_TEST_QUESTIONS.filter(q => 
      q.subject === 'Aptitude' && !answeredIds.has(q.id)
    ));

    // Pool for Subject (20 total)
    const subjectPool = MOCK_TEST_QUESTIONS.filter(q =>
      q.subject === fieldOfStudy && 
      (q.audience === 'Both' || q.audience === educationLevel) &&
      !answeredIds.has(q.id)
    );

    const theoreticalSubject = shuffle(subjectPool.filter(q => q.type === 'theoretical'));
    const solvingSubject = shuffle(subjectPool.filter(q => q.type === 'solving'));

    // Final Selection logic: 10 Aptitude + 20 Subject
    const selectedAptitude = aptitudePool.slice(0, 10);
    const selectedTheoretical = theoreticalSubject.slice(0, 10);
    const selectedSolving = solvingSubject.slice(0, 10);

    const selectedSubject = [...selectedTheoretical, ...selectedSolving];
    
    // Fill if pool is low on unique items
    if (selectedSubject.length < 20) {
      const remainingPool = shuffle(subjectPool.filter(q => !selectedSubject.find(s => s.id === q.id)));
      selectedSubject.push(...remainingPool.slice(0, 20 - selectedSubject.length));
    }

    const finalSession = shuffle([...selectedAptitude, ...selectedSubject]);

    if (finalSession.length === 0) {
      alert("No unique questions available for this domain. Retaking previously answered ones.");
      const repeatSession = shuffle(MOCK_TEST_QUESTIONS.filter(q => q.subject === fieldOfStudy || q.subject === 'Aptitude')).slice(0, 30);
      setSessionQuestions(repeatSession);
    } else {
      setSessionQuestions(finalSession);
    }

    updateProfile({ educationLevel, fieldOfStudy });
    setAttempts({});
    setCurrentIdx(0);
    setTimeLeft(1800); 
    setStep('test');
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleFinish(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswer = (optionIdx: number | null) => {
    const q = sessionQuestions[currentIdx];
    if (!q) return;
    setAttempts(prev => ({
      ...prev,
      [q.id]: {
        questionId: q.id,
        chosenOptionIdx: optionIdx,
        correctAnswerIdx: q.correctAnswerIdx,
        isCorrect: optionIdx === q.correctAnswerIdx,
        subject: q.subject
      }
    }));
    if (currentIdx < sessionQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
        handleFinish();
    }
  };

  const handleFinish = async () => {
    clearInterval(timerRef.current);
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

    setIsLoadingFeedback(true);
    const [analysis, resources] = await Promise.all([
      getDetailedAnalysis(fieldOfStudy, accuracy, breakdown, lang),
      getImprovementResources(fieldOfStudy, accuracy, lang)
    ]);
    
    setDetailedAnalysis(analysis);
    setRecommendedResources(resources);
    
    const globallyAnswered = new Set(user.answeredQuestionIds || []);
    results.forEach(a => globallyAnswered.add(a.questionId));

    updateProfile({ 
      points: user.points + earnedPoints, 
      answeredQuestionIds: Array.from(globallyAnswered),
      testHistory: [{ 
        id: Math.random().toString(36).substr(2, 9), 
        date: new Date().toISOString(), 
        field: fieldOfStudy, 
        score: correctCount * 10, 
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

  if (step === 'setup') {
    const answeredIds = new Set(user.answeredQuestionIds || []);
    const availableAptitude = MOCK_TEST_QUESTIONS.filter(q => q.subject === 'Aptitude' && !answeredIds.has(q.id)).length;
    const availableSubject = fieldOfStudy ? MOCK_TEST_QUESTIONS.filter(q => q.subject === fieldOfStudy && !answeredIds.has(q.id)).length : 0;

    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[80vh] animate-in zoom-in-95 space-y-10">
        <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100 text-center w-full">
            <Trophy className="w-14 h-14 mx-auto mb-6 text-indigo-600" />
            <h1 className="text-4xl font-black text-slate-800 mb-4">{strings.test}</h1>
            <p className="text-slate-500 mb-8 font-bold text-lg italic">10 Aptitude + 20 Subject Items • 30 Minutes</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <button onClick={() => setEducationLevel('School')} className={`p-10 rounded-[3rem] border-4 transition-all ${educationLevel === 'School' ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-slate-50 hover:border-indigo-100'}`}>
                <School className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                <span className="font-black text-xl">{strings.schoolLevel}</span>
              </button>
              <button onClick={() => setEducationLevel('College')} className={`p-10 rounded-[3rem] border-4 transition-all ${educationLevel === 'College' ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-slate-50 hover:border-indigo-100'}`}>
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                <span className="font-black text-xl">{strings.collegeLevel}</span>
              </button>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">{strings.objectiveStream}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {(educationLevel === 'School' ? SCHOOL_STREAMS : COLLEGE_FIELDS).map(f => (
                <button key={f} onClick={() => setFieldOfStudy(f)} className={`px-6 py-4 rounded-[1.5rem] font-black text-sm text-center border-2 transition-all ${fieldOfStudy === f ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' : 'border-slate-100 hover:bg-slate-50'}`}>
                  {f}
                </button>
              ))}
            </div>

            {fieldOfStudy && (
              <div className="mb-8 bg-indigo-50 border border-indigo-100 p-6 rounded-3xl text-left">
                 <h4 className="font-black text-xs uppercase tracking-widest text-indigo-400 mb-4">Unique Question Pool</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Aptitude</p>
                       <p className="text-xl font-black text-slate-800">{availableAptitude} Unique</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase">{fieldOfStudy}</p>
                       <p className="text-xl font-black text-slate-800">{availableSubject} Unique</p>
                    </div>
                 </div>
              </div>
            )}
            
            <button 
              disabled={!fieldOfStudy} 
              onClick={handleStartTest} 
              className="w-full py-6 bg-indigo-600 text-white font-black text-2xl rounded-[2rem] shadow-2xl hover:bg-indigo-700 hover:scale-[1.01] transition-all disabled:opacity-30"
            >
              {strings.startTest}
            </button>
        </div>
      </div>
    );
  }

  if (step === 'test') {
    const q = sessionQuestions[currentIdx];
    const qText = q.text[lang] || q.text['en'];
    const qOptions = q.options[lang] || q.options['en'];

    return (
      <div className="p-8 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-inner ${q.subject === 'Aptitude' ? 'bg-purple-600' : 'bg-indigo-600'}`}>
                {currentIdx + 1}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{q.subject} • {q.type}</p>
                 <div className="flex gap-1 mt-1">
                    {sessionQuestions.map((_, i) => (
                      <div key={i} className={`h-1.5 w-2 rounded-full ${i === currentIdx ? 'bg-indigo-600 w-4' : i < currentIdx ? 'bg-indigo-200' : 'bg-slate-100'}`}></div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl flex items-center gap-3 shadow-lg">
              <Clock className="w-6 h-6 animate-pulse" /> {formatTime(timeLeft)}
           </div>
        </div>

        <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl min-h-[400px] flex flex-col justify-center mb-10 border border-slate-50 relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-12 leading-tight">
               {qText}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {qOptions.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleAnswer(i)} 
                  className={`p-7 rounded-[2.5rem] text-left font-black text-xl border-4 transition-all hover:scale-[1.02] ${attempts[q.id]?.chosenOptionIdx === i ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-50 bg-slate-50 hover:border-indigo-100'}`}
                >
                  <span className="inline-flex w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center mr-4 text-sm">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>
        </div>

        <div className="flex justify-between items-center">
           <button onClick={() => handleAnswer(null)} className="px-10 py-5 font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
              {strings.skip}
           </button>
           <button 
             onClick={currentIdx === sessionQuestions.length - 1 ? handleFinish : () => setCurrentIdx(prev => prev + 1)} 
             className="px-16 py-6 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-3"
           >
             {currentIdx === sessionQuestions.length - 1 ? strings.finish : 'Next Question'} <ArrowRight className="w-6 h-6" />
           </button>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="p-8 max-w-5xl mx-auto pb-20 animate-in fade-in duration-700">
        <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden text-center p-16 md:p-24 border border-slate-100 relative">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-8 drop-shadow-lg" />
            <h1 className="text-5xl font-black mb-12 tracking-tighter">{strings.results}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
               <div className="p-10 bg-indigo-50 rounded-[3rem] border border-indigo-100 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-indigo-600 mb-2 tracking-widest">{strings.accuracy}</p>
                 <p className="text-5xl font-black text-indigo-900">{Math.round((Object.values(attempts).filter(a => a.isCorrect).length / (sessionQuestions.length || 1)) * 100)}%</p>
               </div>
               <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 tracking-widest">Correct</p>
                 <p className="text-5xl font-black text-emerald-900">{Object.values(attempts).filter(a => a.isCorrect).length}</p>
               </div>
               <div className="p-10 bg-amber-50 rounded-[3rem] border border-amber-100 shadow-sm">
                 <p className="text-[10px] font-black uppercase text-amber-600 mb-2 tracking-widest">{strings.points}</p>
                 <p className="text-5xl font-black text-amber-900">+{Object.values(attempts).filter(a => a.isCorrect).length * 10}</p>
               </div>
            </div>

            <button onClick={() => window.location.hash = '#/profile'} className="px-14 py-6 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                {strings.reviewAnswers} <History className="w-5 h-5" />
            </button>
        </div>
      </div>
    );
  }
  return null;
};

export default MockTest;
