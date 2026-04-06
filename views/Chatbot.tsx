
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Loader2, Globe, Languages, Trash2 } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { UserProfile, ChatMessage } from '../types';
import { UI_STRINGS } from '../constants';

const Chatbot: React.FC<{ user: UserProfile, updateProfile: (u: Partial<UserProfile>) => void }> = ({ user, updateProfile }) => {
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
      case 'hi': return `नमस्ते ${user.name}! मैं आपका मार्गदर्शक AI मेंटर हूँ। मैं छात्रवृत्तियों और करियर विकल्पों में आपकी कैसे मदद कर सकता हूँ?`;
      case 'bn': return `নমস্কার ${user.name}! আমি আপনার মার্গদর্শক AI মেন্টর। আমি আপনাকে কীভাবে সাহায্য করতে পারি?`;
      case 'ta': return `வணக்கம் ${user.name}! நான் உங்கள் மார்க்தர்ஷக் AI வழிகாட்டி. நான் உங்களுக்கு எப்படி உதவ முடியும்?`;
      case 'te': return `నమస్కారం ${user.name}! నేను మీ మార్గదర్శక్ AI మెంటర్. నేను మీకు ఎలా సహాయం చేయగలను?`;
      case 'kn': return `ನಮಸ್ಕಾರ ${user.name}! ನಾನು ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಕ್ AI ಮೆಂಟರ್. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`;
      case 'ml': return `നമസ്കാരം ${user.name}! ഞാൻ നിങ്ങളുടെ മാർഗ്ഗദർശക് AI മെന്ററാണ്. നിങ്ങൾക്ക് എങ്ങനെ സഹായിക്കാനാകും?`;
      case 'mr': return `नमस्कार ${user.name}! मी तुमचा मार्गदर्शक AI मेंटर आहे. मी तुम्हाला कशी मदत करू शकतो?`;
      case 'ur': return `آداب ${user.name}! میں آپ کا مارگ درشک AI مینٹر ہوں۔ میں آپ کی کس طرح مدد کر سکتا ہوں؟`;
      default: return `Hello ${user.name}! I am your MargDarshak AI Mentor. How can I help you discover scholarships and career paths today?`;
    }
  };

  // Load initial messages from user.chatHistory if available, otherwise start with greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (user.chatHistory && user.chatHistory.length > 0) {
      return user.chatHistory;
    }
    return [{ role: 'model', text: getGreeting(), timestamp: new Date().toISOString() }];
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Sync state to persistent storage
  useEffect(() => {
    updateProfile({ chatHistory: messages });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      text: input, 
      timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const result = await getGeminiResponse(input, history, user);
    
    const aiMessage: ChatMessage = { 
      role: 'model', 
      text: result.text, 
      timestamp: new Date().toISOString(),
      sources: result.sources 
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your conversation history?")) {
      setMessages([{ role: 'model', text: getGreeting(), timestamp: new Date().toISOString() }]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl md:shadow-none border-x">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold">MargDarshak AI</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-100 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              Speaking in {languageNames[lang]}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={clearHistory}
             className="p-2 hover:bg-white/20 rounded-xl transition-all text-indigo-100 hover:text-white"
             title="Clear Conversation"
           >
             <Trash2 className="w-4 h-4" />
           </button>
           <div className="flex items-center gap-2">
             <Languages className="w-4 h-4 text-indigo-200" />
             <span className="text-xs font-bold text-indigo-100 uppercase">{lang}</span>
           </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-slate-100'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                {msg.text.split('\n').map((line, j) => (
                  <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
                
                {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Verified Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source: any, idx: number) => (
                        source.web && (
                          <a key={idx} href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:underline bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />
                            {source.web.title || 'Visit Source'}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
                <div className={`text-[9px] mt-2 opacity-40 text-right font-medium`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-indigo-600">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium italic">
                AI is searching...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t sticky bottom-0 z-10">
        <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
          <input 
            type="text" 
            placeholder={lang === 'hi' ? "यहाँ अपना प्रश्न पूछें..." : strings.guidance + "..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent border-none focus:outline-none px-4 py-2 text-sm text-slate-800"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-xl transition-all ${input.trim() && !isTyping ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-300 text-white cursor-not-allowed'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
