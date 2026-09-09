import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Sparkles, Loader2, Globe, Languages, Trash2, 
  Mic, MicOff, Volume2, VolumeX, Copy, Check, HelpCircle, 
  ArrowRight, CornerDownLeft
} from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { UserProfile, ChatMessage } from '../types';
import { UI_STRINGS } from '../constants';

interface ChatbotProps {
  user: UserProfile;
  updateProfile: (u: Partial<UserProfile>) => void;
}

const LANGUAGE_SPEECH_CODES: Record<string, string> = {
  'en': 'en-IN',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'mr': 'mr-IN',
  'ur': 'ur-IN'
};

const SUGGESTED_PROMPTS: Record<string, string[]> = {
  en: [
    "Which government scholarships am I eligible for?",
    "How do I apply on the National Scholarship Portal (NSP)?",
    "Best affordable career options after 12th in my stream?",
    "Documents needed for income certificate verification?"
  ],
  hi: [
    "मेरी श्रेणी और आय के अनुसार कौन सी सरकारी छात्रवृत्तियां उपलब्ध हैं?",
    "नेशनल स्कॉलरशिप पोर्टल (NSP) पर आवेदन कैसे करें?",
    "12वीं के बाद कम खर्च में बेहतरीन करियर विकल्प क्या हैं?",
    "आय और जाति प्रमाण पत्र सत्यापन के लिए क्या जरूरी है?"
  ]
};

const Chatbot: React.FC<ChatbotProps> = ({ user, updateProfile }) => {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'hi': 'Hindi (हिन्दी)',
    'bn': 'Bengali (বাংলা)',
    'ta': 'Tamil (தமிழ்)',
    'te': 'Telugu (తెలుగు)',
    'kn': 'Kannada (ಕನ್ನಡ)',
    'ml': 'Malayalam (മലയാളം)',
    'mr': 'Marathi (मराठी)',
    'ur': 'Urdu (اردو)'
  };

  const lang = user.language || 'en';
  const strings = UI_STRINGS[lang] || UI_STRINGS['en'];

  const getGreeting = () => {
    switch(lang) {
      case 'hi': return `नमस्ते ${user.name}! मैं आपका मार्गदर्शक AI मेंटर हूँ। मैं छात्रवृत्तियों, सरकारी योजनाओं और करियर मार्गदर्शन में आपकी क्या मदद कर सकता हूँ?`;
      case 'bn': return `নমস্কার ${user.name}! আমি আপনার মার্গদর্শক AI মেন্টর। আমি আপনাকে কীভাবে সাহায্য করতে পারি?`;
      case 'ta': return `வணக்கம் ${user.name}! நான் உங்கள் மார்க்தர்ஷக் AI வழிகாட்டி. நான் உங்களுக்கு எப்படி உதவ முடியும்?`;
      case 'te': return `నమస్కారం ${user.name}! నేను మీ మార్గదర్శక్ AI మెంటర్. నేను మీకు ఎలా సహాయం చేయగలను?`;
      case 'kn': return `ನಮಸ್ಕಾರ ${user.name}! ನಾನು ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಕ್ AI ಮೆಂಟರ್. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`;
      case 'ml': return `നമസ്കാരം ${user.name}! ഞാൻ നിങ്ങളുടെ മാർഗ്ഗദർശക് AI മെന്ററാണ്. നിങ്ങൾക്ക് എങ്ങനെ സഹായിക്കാനാകും?`;
      case 'mr': return `नमस्कार ${user.name}! मी तुमचा मार्गदर्शक AI मेंटर आहे. मी तुम्हाला कशी मदत करू शकतो?`;
      case 'ur': return `آداب ${user.name}! میں آپ کا مارگ درشک AI مینٹر ہوں۔ میں آپ کی کس طرح مدد कर सकता ہوں؟`;
      default: return `Hello ${user.name}! I am your MargDarshak AI Mentor. How can I help you discover scholarships, government schemes, or career paths today?`;
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (user.chatHistory && user.chatHistory.length > 0) {
      return user.chatHistory;
    }
    return [{ role: 'model', text: getGreeting(), timestamp: new Date().toISOString() }];
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = LANGUAGE_SPEECH_CODES[lang] || 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lang]);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Sync to database
  useEffect(() => {
    // Keep last 40 messages to maintain clean performance
    const capped = messages.slice(-40);
    updateProfile({ chatHistory: capped });
  }, [messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isTyping) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      text: textToSend, 
      timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const history = messages.slice(-10).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const result = await getGeminiResponse(textToSend, history, user);
    
    const aiMessage: ChatMessage = { 
      role: 'model', 
      text: result.text, 
      timestamp: new Date().toISOString(),
      sources: result.sources 
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported on this browser. Try Chrome or Edge!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = LANGUAGE_SPEECH_CODES[lang] || 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleSpeak = (text: string, idx: number) => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis is not supported on your device.");
      return;
    }

    if (speakingMsgIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = LANGUAGE_SPEECH_CODES[lang] || 'en-IN';
    utterance.onend = () => setSpeakingMsgIdx(null);
    utterance.onerror = () => setSpeakingMsgIdx(null);

    setSpeakingMsgIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearHistory = () => {
    if (confirm("Clear conversation history?")) {
      setMessages([{ role: 'model', text: getGreeting(), timestamp: new Date().toISOString() }]);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  };

  const chips = SUGGESTED_PROMPTS[lang] || SUGGESTED_PROMPTS['en'];

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      
      {/* Mentor Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="font-black text-base tracking-tight flex items-center gap-2">
              MargDarshak AI Mentor
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h2>
            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider">
              Multilingual Guidance • {languageNames[lang] || 'English'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={clearHistory}
            className="p-2 hover:bg-white/20 rounded-xl transition-all text-indigo-100 hover:text-white"
            title="Reset Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="bg-white/10 px-3 py-1 rounded-xl text-xs font-black uppercase text-indigo-100">
            {lang}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isUser ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-slate-100'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}

                  {/* Sources */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">
                        Official Citations:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((s: any, sIdx: number) => (
                          s.web && (
                            <a 
                              key={sIdx} 
                              href={s.web.uri} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] text-indigo-600 font-bold hover:underline bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 flex items-center gap-1"
                            >
                              <Globe className="w-2.5 h-2.5" />
                              {s.web.title || 'Official Source'}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom bar for model messages: Listen & Copy */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSpeak(msg.text, idx)}
                          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${
                            speakingMsgIdx === idx ? 'text-indigo-600 bg-indigo-50 font-black' : 'hover:text-slate-600'
                          }`}
                          title="Listen in your language"
                        >
                          {speakingMsgIdx === idx ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          {speakingMsgIdx === idx ? 'Stop Audio' : 'Listen'}
                        </button>
                        <button
                          onClick={() => copyToClipboard(msg.text, idx)}
                          className="p-1.5 rounded-lg hover:text-slate-600 transition-colors flex items-center gap-1 text-[10px] font-bold"
                          title="Copy message"
                        >
                          {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedIdx === idx ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <span className="text-[9px] font-bold opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100 text-slate-400 text-xs font-bold italic shadow-sm">
                MargDarshak is finding verified guidance...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Suggestions:</span>
          {chips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              className="px-3 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 whitespace-nowrap transition-colors shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 sticky bottom-0 z-10 shrink-0">
        <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
          <input 
            type="text" 
            placeholder={lang === 'hi' ? "यहाँ अपना प्रश्न लिखें या बोलें..." : "Ask your scholarship or career question..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent border-none focus:outline-none px-3 py-2 text-xs sm:text-sm font-bold text-slate-800"
          />

          {/* Voice Input Button */}
          <button
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl transition-all ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse shadow-md' 
                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'
            }`}
            title={isListening ? "Listening... click to stop" : "Speak your question (Hindi / English)"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`p-2.5 rounded-xl transition-all ${
              input.trim() && !isTyping 
                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
