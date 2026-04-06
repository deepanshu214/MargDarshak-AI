
import React from 'react';
import { BookOpen, GraduationCap, Users, Trophy, Wallet, Medal, FileUser } from 'lucide-react';
import { Question } from './types';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'ur', name: 'Urdu (اردو)' }
];

export const UI_STRINGS: Record<string, Record<string, string>> = {
  en: {
    home: "Home", schemes: "Schemes", test: "Mock Test", guidance: "AI Guidance", resume: "AI Resume",
    leaderboard: "Leaderboard", profile: "Profile", welcome: "Welcome", points: "XP Points",
    badges: "Badges", startTest: "Start Assessment", aiMentor: "AI Mentor", language: "Language",
    logout: "Sign Out", rank: "Rank", verifyEmail: "Verify Your Email", enterCode: "Enter Code",
    verify: "Verify", login: "Login", signup: "Sign Up", fullName: "Full Name", emailAddr: "Email Address",
    password: "Password", level: "Level", results: "Test Results", accuracy: "Accuracy",
    learning: "Learning", support: "Support", career: "Career",
    verifiedSchemes: "Verified Schemes", talentSearch: "Talent Search", peerNetwork: "Peer Network",
    scholarshipHub: "Scholarship Hub", provider: "Provider", eligibility: "Eligibility", benefits: "Benefits",
    prepareSuccess: "Prepare for Success", schoolLevel: "School Level", collegeLevel: "College Level",
    objectiveStream: "Objective Stream", skip: "Skip", finish: "Finish", retake: "Retake", 
    reviewAnswers: "Review Answers", yourAnswer: "Your Answer", correctAnswer: "Correct Answer",
    trustScore: "Trust Score", completeProfile: "Profile Information", basicInfo: "Basic Info", 
    careerGuidance: "Career Guidance", aiResumeBuilder: "AI Resume Builder", generateWithAi: "Generate with AI",
    summary: "Summary", skills: "Skills", achievements: "Achievements", careerPaths: "Career Paths"
  },
  hi: {
    home: "होम", schemes: "योजनाएं", test: "मॉक टेस्ट", guidance: "AI मार्गदर्शन", resume: "AI बायोडाटा",
    leaderboard: "लीडरबोर्ड", profile: "प्रोफ़ाइल", welcome: "स्वागत है", points: "XP अंक",
    badges: "बैज", startTest: "मूल्यांकन शुरू करें", aiMentor: "AI मेंटर", language: "भाषा",
    logout: "लॉगआउट", rank: "रैंक", verifyEmail: "ईमेल सत्यापित करें", enterCode: "कोड दर्ज करें",
    verify: "सत्यापित करें", login: "लॉगिन", signup: "साइन अप", fullName: "पूरा नाम", emailAddr: "ईमेल पता",
    password: "पासवर्ड", level: "स्तर", results: "टेस्ट परिणाम", accuracy: "सटीकता",
    learning: "शिक्षा", support: "सहायता", career: "करियर",
    verifiedSchemes: "सत्यापित योजनाएं", talentSearch: "प्रतिभा खोज", peerNetwork: "सहकर्मी नेटवर्क",
    scholarshipHub: "छात्रवृत्ति केंद्र", provider: "प्रदाता", eligibility: "पात्रता", benefits: "लाभ",
    prepareSuccess: "सफलता की तैयारी", schoolLevel: "स्कूली स्तर", collegeLevel: "कॉलेज स्तर",
    objectiveStream: "उद्देश्य स्ट्रीम", skip: "छोड़ें", finish: "समाप्त करें", retake: "पुनः प्रयास करें",
    reviewAnswers: "उत्तरों की समीक्षा", yourAnswer: "आपका उत्तर", correctAnswer: "सही उत्तर",
    trustScore: "ट्रस्ट स्कोर", completeProfile: "प्रोफ़ाइल पूर्ण करें", basicInfo: "मूल जानकारी",
    careerGuidance: "करियर मार्गदर्शन", aiResumeBuilder: "AI बायोडाटा निर्माता", generateWithAi: "AI के साथ बनाएं",
    summary: "सारांश", skills: "कौशल", achievements: "उपलब्धियां", careerPaths: "करियर पथ"
  },
  bn: {
    home: "হোম", schemes: "প্রকল্প", test: "মক টেস্ট", guidance: "AI পরামর্শ", resume: "AI সিভি",
    leaderboard: "লিডারবোর্ড", profile: "প্রোফাইল", welcome: "স্বাগতম", points: "XP পয়েন্ট",
    badges: "ব্যাজ", startTest: "টেস্ট শুরু করুন", aiMentor: "AI মেন্টর", language: "ভাষা",
    logout: "লগ আউট", rank: "র‍্যাঙ্ক", verifyEmail: "ইমেল যাচাই করুন", enterCode: "কোড দিন",
    verify: "যাচাই করুন", login: "লগইন", signup: "সাইন আপ", fullName: "পুরো নাম", emailAddr: "ইমেল ঠিকানা",
    password: "পাসওয়ার্ড", level: "স্তর", results: "ফলাফল", accuracy: "নির্ভুলতা",
    learning: "শিক্ষা", support: "সহায়তা", career: "কেরিয়ার",
    verifiedSchemes: "যাচাইকৃত প্রকল্প", talentSearch: "প্রতিভা সন্ধান", peerNetwork: "সহকর্মী নেটওয়ার্ক",
    scholarshipHub: "স্কলারশিপ হাব", provider: "প্রদানকারী", eligibility: "যোগ্যতা", benefits: "সুবিধা",
    prepareSuccess: "সাফল্যের প্রস্তুতি", schoolLevel: "স্কুল স্তর", collegeLevel: "কলেজ স্তর",
    objectiveStream: "উদ্দেশ্য স্ট্রিম", skip: "বাদ দিন", finish: "শেষ করুন", retake: "আবার দিন", 
    reviewAnswers: "উত্তর পর্যালোচনা", yourAnswer: "আপনার উত্তর", correctAnswer: "সঠিক উত্তর",
    trustScore: "বিশ্বাস স্কোর", completeProfile: "প্রোফাইল পূরণ করুন", basicInfo: "মৌলিক তথ্য", 
    careerGuidance: "কেরিয়ার পরামর্শ", aiResumeBuilder: "AI সিভি নির্মাতা", generateWithAi: "AI দিয়ে তৈরি করুন",
    summary: "সারসংক্ষেপ", skills: "দক্ষতা", achievements: "সাফল্য", careerPaths: "কেরিয়ার পথ"
  },
  ta: {
    home: "முகப்பு", schemes: "திட்டங்கள்", test: "மாதிரி தேர்வு", guidance: "AI வழிகாட்டுதல்", resume: "AI ரெஸ்யூம்",
    leaderboard: "தரவரிசை", profile: "சுயவிவரம்", welcome: "வரவேற்கிறோம்", points: "XP புள்ளிகள்",
    badges: "பேட்ஜ்கள்", startTest: "தேர்வைத் தொடங்கு", aiMentor: "AI வழிகாட்டி", language: "மொழி",
    logout: "வெளியேறு", rank: "தரவரிசை", verifyEmail: "மின்னஞ்சலைச் சரிபார்க்கவும்", enterCode: "குறியீட்டை உள்ளிடவும்",
    verify: "சரிபார்க்கவும்", login: "உள்நுழை", signup: "பதிவு செய்க", fullName: "முழு பெயர்", emailAddr: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்", level: "நிலை", results: "தேர்வு முடிவுகள்", accuracy: "துல்லியம்",
    learning: "கற்றல்", support: "ஆதரவு", career: "தொழில்",
    verifiedSchemes: "சரிபார்க்கப்பட்ட திட்டங்கள்", talentSearch: "திறமை தேடல்", peerNetwork: "நண்பர்கள் குழு",
    scholarshipHub: "உதவித்தொகை மையம்", provider: "வழங்குபவர்", eligibility: "தகுதி", benefits: "பலன்கள்",
    prepareSuccess: "வெற்றிக்குத் தயாராகுங்கள்", schoolLevel: "பள்ளி நிலை", collegeLevel: "கல்லூரி நிலை",
    objectiveStream: "நோக்கம்", skip: "தவிர்", finish: "முடிக்க", retake: "மீண்டும் செய்", 
    reviewAnswers: "விடைகளைச் சரிபார்", yourAnswer: "உங்கள் விடை", correctAnswer: "சரியான விடை",
    trustScore: "நம்பிக்கை மதிப்பெண்", completeProfile: "சுயவிவரத்தைப் பூர்த்தி செய்க", basicInfo: "அடிப்படைத் தகவல்", 
    careerGuidance: "தொழில் வழிகாட்டல்", aiResumeBuilder: "AI ரெஸ்யூம் பில்டர்", generateWithAi: "AI மூலம் உருவாக்குக",
    summary: "சுருக்கம்", skills: "திறன்கள்", achievements: "சாதனைகள்", careerPaths: "தொழில் பாதைகள்"
  },
  te: {
    home: "హోమ్", schemes: "పథకాలు", test: "మాక్ టెస్ట్", guidance: "AI మార్గదర్శకత్వం", resume: "AI రెజ్యూమ్",
    leaderboard: "లీడర్‌బోర్డ్", profile: "ప్రొఫైల్", welcome: "స్వాగతం", points: "XP పాయింట్లు",
    badges: "బ్యాడ్జ్‌లు", startTest: "పరీక్ష ప్రారంభించండి", aiMentor: "AI మెంటర్", language: "భాష",
    logout: "లాగ్ అవుట్", rank: "ర్యాంక్", verifyEmail: "ఈమెయిల్ ధృవీకరించండి", enterCode: "కోడ్ ఎంటర్ చేయండి",
    verify: "ధృవీకరించు", login: "లాగిన్", signup: "సైన్ అప్", fullName: "పూర్తి పేరు", emailAddr: "ఈమెయిల్ చిరునామా",
    password: "పాస్‌వర్డ్", level: "స్థాయి", results: "పరీక్ష ఫలితాలు", accuracy: "ఖచ్చితత్వం",
    learning: "అభ్యాసం", support: "మద్దతు", career: "కెరీర్",
    verifiedSchemes: "ధృవీకరించబడిన పథకాలు", talentSearch: "ప్రతిభ శోధన", peerNetwork: "నెట్‌వర్క్",
    scholarshipHub: "స్కాలర్‌షిప్ హబ్", provider: "ప్రదాత", eligibility: "అర్హత", benefits: "ప్రయోజనాలు",
    prepareSuccess: "విజయానికి సిద్ధపడండి", schoolLevel: "స్కూల్ లెవల్", collegeLevel: "కాలేజీ లెవల్",
    objectiveStream: "స్ట్రీమ్", skip: "వదిలేయి", finish: "పూర్తయింది", retake: "మళ్లీ చేయి", 
    reviewAnswers: "సమాధానాలు సమీక్షించండి", yourAnswer: "నీ సమాధానం", correctAnswer: "సరైన సమాధానం",
    trustScore: "ట్రస్ట్ స్కోర్", completeProfile: "ప్రొఫైల్ పూర్తి చేయండి", basicInfo: "ప్రాథమిక సమాచారం", 
    careerGuidance: "కెరీర్ గైడెన్స్", aiResumeBuilder: "AI రెజ్యూమ్ బిల్డర్", generateWithAi: "AI తో సృష్టించు",
    summary: "సారాంశం", skills: "నైపుణ్యాలు", achievements: "విజయాలు", careerPaths: "కెరీర్ మార్గాలు"
  },
  kn: {
    home: "ಮುಖಪುಟ", schemes: "ಯೋಜನೆಗಳು", test: "ಮಾಕ್ ಟೆಸ್ಟ್", guidance: "AI ಮಾರ್ಗದರ್ಶನ", resume: "AI ರೆಸ್ಯೂಮೆ",
    leaderboard: "ಲೀಡರ್‌ಬೋರ್ಡ್", profile: "ಪ್ರೊಫೈಲ್", welcome: "ಸ್ವಾಗತ", points: "XP ಅಂಕಗಳು",
    badges: "ಬ್ಯಾಡ್ಜ್‌ಗಳು", startTest: "ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ", aiMentor: "AI ಮೆಂಟರ್", language: "ಭಾಷೆ",
    logout: "ಲಾಗ್ ಔಟ್", rank: "ಶ್ರೇಣಿ", verifyEmail: "ಇಮೇಲ್ ದೃಢೀಕರಿಸಿ", enterCode: "ಕೋಡ್ ನಮೂದಿಸಿ",
    verify: "ದೃಢೀಕರಿಸಿ", login: "ಲಾಗಿನ್", signup: "ಸೈನ್ ಅಪ್", fullName: "ಪೂರ್ಣ ಹೆಸರು", emailAddr: "ಇಮೇಲ್ ವಿಳಾಸ",
    password: "ಪಾಸ್‌ವರ್ಡ್", level: "ಮಟ್ಟ", results: "ಫಲಿತಾಂಶಗಳು", accuracy: "ನಿಖರತೆ",
    learning: "ಕಲಿಕೆ", support: "ಬೆಂಬಲ", career: "ವೃತ್ತಿಜೀವನ",
    verifiedSchemes: "ದೃಢೀಕೃತ ಯೋಜನೆಗಳು", talentSearch: "ಪ್ರತಿಭೆ ಶೋಧನೆ", peerNetwork: "ನೆಟ್‌ವರ್ಕ್",
    scholarshipHub: "ಶಿಷ್ಯವೇತನ ಕೇಂದ್ರ", provider: "ಒದಗಿಸುವವರು", eligibility: "ಅರ್ಹತೆ", benefits: "ಪ್ರಯೋಜನಗಳು",
    prepareSuccess: "ಯಶಸ್ಸಿಗೆ ಸಿದ್ಧರಾಗಿ", schoolLevel: "ಶಾಲಾ ಮಟ್ಟ", collegeLevel: "ಕಾಲೇಜು ಮಟ್ಟ",
    objectiveStream: "ವಿಷಯ", skip: "ಬಿಟ್ಟುಬಿಡಿ", finish: "ಮುಗಿಸಿ", retake: "ಮರುಪ್ರಯತ್ನಿಸಿ", 
    reviewAnswers: "ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ", yourAnswer: "ನಿಮ್ಮ ಉತ್ತರ", correctAnswer: "ಸರಿಯಾದ ಉತ್ತರ",
    trustScore: "ನಂಬಿಕೆಯ ಸ್ಕೋರ್", completeProfile: "ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ", basicInfo: "ಮೂಲ ಮಾಹಿತಿ", 
    careerGuidance: "ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶನ", aiResumeBuilder: "AI ರೆಸ್ಯೂಮೆ ಬಿಲ್ಡರ್", generateWithAi: "AI ಮೂಲಕ ರಚಿಸಿ",
    summary: "ಸಾರಾಂಶ", skills: "ಕೌಶಲ್ಯಗಳು", achievements: "ಸಾಧನೆಗಳು", careerPaths: "ವೃತ್ತಿ ಮಾರ್ಗಗಳು"
  },
  ml: {
    home: "ഹോം", schemes: "പദ്ധതികൾ", test: "മോക്ക് ടെസ്റ്റ്", guidance: "AI മാർഗനിർദ്ദേശം", resume: "AI റെസ്യൂമെ",
    leaderboard: "ലീഡർബോർഡ്", profile: "പ്രൊഫൈൽ", welcome: "സ്വാഗതം", points: "XP പോയിന്റുകൾ",
    badges: "ബാഡ്ജുകൾ", startTest: "ടെസ്റ്റ് തുടങ്ങുക", aiMentor: "AI മെന്റർ", language: "ഭാഷ",
    logout: "ലോഗ് ഔട്ട്", rank: "റാങ്ക്", verifyEmail: "ഇമെയിൽ പരിശോധിക്കുക", enterCode: "കോഡ് നൽകുക",
    verify: "പരിശോധിക്കുക", login: "ലോഗിൻ", signup: "സൈൻ അപ്പ്", fullName: "മുഴുവൻ പേര്", emailAddr: "ഇമെയിൽ വിലാസം",
    password: "പാസ്‌വേഡ്", level: "നില", results: "ഫലം", accuracy: "കൃത്യത",
    learning: "പഠനം", support: "പിന്തുണ", career: "കരിയർ",
    verifiedSchemes: "അംഗീകൃത പദ്ധതികൾ", talentSearch: "പ്രതിഭ കണ്ടെത്തൽ", peerNetwork: "നെറ്റ്‌വർക്ക്",
    scholarshipHub: "സ്കോളർഷിപ്പ് ഹബ്", provider: "ദാതാവ്", eligibility: "യോഗ്യത", benefits: "ഗുണങ്ങൾ",
    prepareSuccess: "വിജയത്തിനായി ഒരുങ്ങുക", schoolLevel: "സ്കൂൾ തലം", collegeLevel: "കോളേജ് തലം",
    objectiveStream: "വിഷയം", skip: "ഒഴിവാക്കുക", finish: "പൂർത്തിയാക്കുക", retake: "വീണ്ടും ചെയ്യുക", 
    reviewAnswers: "ഉത്തരങ്ങൾ പരിശോധിക്കുക", yourAnswer: "നിങ്ങളുടെ ഉത്തരം", correctAnswer: "ശരിയായ ഉത്തരം",
    trustScore: "വിശ്വാസ സ്കോർ", completeProfile: "പ്രൊഫൈൽ പൂർത്തിയാക്കുക", basicInfo: "അടിസ്ഥാന വിവരങ്ങൾ", 
    careerGuidance: "കരിയർ ഗൈഡൻസ്", aiResumeBuilder: "AI റെസ്യൂമെ ബിൽഡർ", generateWithAi: "AI ഉപയോഗിച്ച് നിർമ്മിക്കുക",
    summary: "സംഗ്രഹം", skills: "കഴിവുകൾ", achievements: "നേട്ടങ്ങൾ", careerPaths: "കരിയർ വഴികൾ"
  },
  mr: {
    home: "होम", schemes: "योजना", test: "मॉक टेस्ट", guidance: "AI मार्गदर्शन", resume: "AI बायोडाटा",
    leaderboard: "लीडरबोर्ड", profile: "प्रोफाईल", welcome: "स्वागत आहे", points: "XP पॉइंट्स",
    badges: "बॅजेस", startTest: "चाचणी सुरू करा", aiMentor: "AI मार्गदर्शक", language: "भाषा",
    logout: "लॉग आउट", rank: "रँक", verifyEmail: "ईमेल सत्यापित करा", enterCode: "कोड टाका",
    verify: "सत्यापित करा", login: "लॉगिन", signup: "साइन अप", fullName: "पूर्ण नाव", emailAddr: "ईमेल पत्ता",
    password: "पासवर्ड", level: "स्तर", results: "निकाल", accuracy: "अचूकता",
    learning: "शिक्षण", support: "मदत", career: "करियर",
    verifiedSchemes: "सत्यापित योजना", talentSearch: "प्रतिभा शोध", peerNetwork: "नेटवर्क",
    scholarshipHub: "शिष्यवृत्ती केंद्र", provider: "प्रदाता", eligibility: "पात्रता", benefits: "फायदे",
    prepareSuccess: "यशाची तयारी", schoolLevel: "शालेय स्तर", collegeLevel: "महाविद्यालयीन स्तर",
    objectiveStream: "शाखा", skip: "वगळा", finish: "पूर्ण करा", retake: "पुन्हा द्या", 
    reviewAnswers: "उत्तरे तपासा", yourAnswer: "तुमचे उत्तर", correctAnswer: "योग्य उत्तर",
    trustScore: "विश्वास निर्देशांक", completeProfile: "प्रोफाईल पूर्ण करा", basicInfo: "मूळ माहिती", 
    careerGuidance: "करियर मार्गदर्शन", aiResumeBuilder: "AI बायोडाटा निर्माता", generateWithAi: "AI सह तयार करा",
    summary: "सारांश", skills: "कौशल्ये", achievements: "यश", careerPaths: "करियर मार्ग"
  },
  ur: {
    home: "ہوم", schemes: "اسکیمیں", test: "موک ٹیسٹ", guidance: "AI رہنمائی", resume: "AI ریزیومے",
    leaderboard: "لیڈر بورڈ", profile: "پروفائل", welcome: "خوش آمدید", points: "XP پوائنٹس",
    badges: "بیجز", startTest: "ٹیسٹ شروع کریں", aiMentor: "AI مینٹر", language: "زبان",
    logout: "لاگ آؤٹ", rank: "درجہ", verifyEmail: "ای میل کی تصدیق کریں", enterCode: "کوڈ درج کریں",
    verify: "تصدیق کریں", login: "لاگ ان", signup: "سائن اپ", fullName: "پورا نام", emailAddr: "ای میل پتہ",
    password: "پاس ورڈ", level: "سطح", results: "نتائج", accuracy: "درستگی",
    learning: "سیکھنا", support: "تعاون", career: "کیریئر",
    verifiedSchemes: "تصدیق شدہ اسکیمیں", talentSearch: "ٹیلنٹ سرچ", peerNetwork: "نیٹ ورک",
    scholarshipHub: "اسکالرشپ ہب", provider: "فراہم کنندہ", eligibility: "اہلیت", benefits: "فوائد",
    prepareSuccess: "کامیابی کی تیاری", schoolLevel: "اسکول کی سطح", collegeLevel: "کالج کی سطح",
    objectiveStream: "شعبہ", skip: "چھوڑ دیں", finish: "ختم کریں", retake: "دوبارہ کوشش کریں", 
    reviewAnswers: "جوابات کا جائزہ", yourAnswer: "آپ کا جواب", correctAnswer: "صحیح جواب",
    trustScore: "ٹرسٹ سکور", completeProfile: "پروفائل مکمل کریں", basicInfo: "بنیادی معلومات", 
    careerGuidance: "کیریئر رہنمائی", aiResumeBuilder: "AI ریزیومے میکر", generateWithAi: "AI کے ساتھ بنائیں",
    summary: "خلاصہ", skills: "مہارتیں", achievements: "کارنامے", careerPaths: "کیریئر کے راستے"
  }
};

export const NAVBAR_LINKS = [
  { id: 'home', name: 'home', href: '/', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'schemes', name: 'schemes', href: '/schemes', icon: <Wallet className="w-5 h-5" /> },
  { id: 'test', name: 'test', href: '/test', icon: <Trophy className="w-5 h-5" /> },
  { id: 'resume', name: 'resume', href: '/resume', icon: <FileUser className="w-5 h-5" /> },
  { id: 'guidance', name: 'guidance', href: '/chatbot', icon: <Users className="w-5 h-5" /> },
  { id: 'leaderboard', name: 'leaderboard', href: '/leaderboard', icon: <Medal className="w-5 h-5" /> },
  { id: 'profile', name: 'profile', href: '/profile', icon: <GraduationCap className="w-5 h-5" /> },
];

export const SCHOOL_STREAMS = [
  "Commerce", 
  "Physics, Chemistry with Maths (PCM)", 
  "Physics, Chemistry with Bio (PCB)", 
  "Physics, Chemistry, Maths with Bio (PCMB)", 
  "Humanities & Arts"
];

export const COLLEGE_FIELDS = [
  "Engineering", "MBBS", "Law", "Management", "Agriculture", "Pure Sciences", "Design"
];

const generateQuestions = () => {
  const qs: Question[] = [];

  const addQ = (id: number, subject: string, type: 'theoretical' | 'solving', en: string, hi: string, opts: string[], correct: number, audience: any, difficulty: 1 | 2 | 3) => {
    qs.push({
      id,
      subject,
      type,
      difficulty,
      audience,
      text: { en, hi, bn: en, ta: en, te: en, kn: en, ml: en, mr: hi, ur: hi },
      options: { en: opts, hi: opts, bn: opts, ta: opts, te: opts, kn: opts, ml: opts, mr: opts, ur: opts },
      correctAnswerIdx: correct
    });
  };

  // Generate Aptitude Questions (Pool of 200)
  for (let i = 0; i < 200; i++) {
    const diff = (i % 3) + 1 as 1 | 2 | 3;
    const type = i % 2 === 0 ? 'solving' : 'theoretical';
    const num1 = Math.floor(Math.random() * 100) + 10;
    const num2 = Math.floor(Math.random() * 50) + 5;
    
    addQ(
      10000 + i,
      "Aptitude",
      type,
      type === 'solving' 
        ? `Find the value: ${num1} x ${num2} / 2 + 15. What is the final result?` 
        : `If a train travels at ${num1} km/h, how much time is needed to cross a ${num2 * 10}m bridge?`,
      type === 'solving'
        ? `मान ज्ञात करें: ${num1} x ${num2} / 2 + 15. अंतिम परिणाम क्या है?`
        : `यदि एक ट्रेन ${num1} किमी/घंटा की गति से चलती है, तो ${num2 * 10} मीटर लंबे पुल को पार करने के लिए कितना समय चाहिए?`,
      [`${(num1 * num2 / 2) + 15}`, `${(num1 * num2 / 2)}`, `45`, `12`],
      0,
      'Both',
      diff
    );
  }

  const allFields = [...SCHOOL_STREAMS, ...COLLEGE_FIELDS];
  allFields.forEach((field, fIdx) => {
    const baseId = 30000 + (fIdx * 1000);
    const audience = SCHOOL_STREAMS.includes(field) ? 'School' : 'College';
    
    // Generate 150 questions per field
    for (let i = 0; i < 150; i++) {
      const diff = (i % 3) + 1 as 1 | 2 | 3;
      const type = i < 75 ? 'theoretical' : 'solving';
      addQ(
        baseId + i,
        field,
        type,
        `[${field}] ${type === 'solving' ? 'Practical application' : 'Theoretical concept'} of topic #${i+1}. Solve or identify correctly.`,
        `[${field}] ${type === 'solving' ? 'व्यावहारिक अनुप्रयोग' : 'सैद्धांतिक अवधारणा'} विषय #${i+1}। सही ढंग से पहचानें।`,
        [`Option A (Correct)`, `Option B`, `Option C`, `Option D`],
        0,
        audience,
        diff
      );
    }
  });

  return qs;
};

export const MOCK_TEST_QUESTIONS = generateQuestions();

export const SAMPLE_SCHEMES = [
  {
    id: 1,
    title: { en: "Post-Matric Scholarship for SC Students", hi: "SC छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति", bn: "SC ছাত্রদের জন্য পোস্ট-ম্যাট্রিক স্কলারশিপ" },
    provider: "Government",
    url: "https://scholarships.gov.in/",
    eligibility: { en: ["SC Category", "Income < ₹2.5L"], hi: ["SC श्रेणी", "आय < ₹2.5L"] },
    benefits: { en: "Full tuition fee reimbursement and maintenance allowance.", hi: "पूर्ण शिक्षण शुल्क प्रतिपूर्ति और रखरखाव भत्ता।" }
  },
  {
    id: 2,
    title: { en: "INSPIRE Scholarship (DST)", hi: "इंसायर छात्रवृत्ति (DST)", bn: "ইন্সপায়ার স্কলারশিপ" },
    provider: "Government",
    url: "https://online-inspire.gov.in/",
    eligibility: { en: ["Top 1% in Class 12", "Basic Sciences Degree"], hi: ["12वीं कक्षा में शीर्ष 1%", "बुनियादी विज्ञान डिग्री"] },
    benefits: { en: "₹80,000 per year for degree courses in Natural Sciences.", hi: "प्राकृतिक विज्ञान में डिग्री पाठ्यक्रमों के लिए प्रति वर्ष ₹80,000।" }
  },
  {
    id: 3,
    title: { en: "Pragati Scholarship for Girls", hi: "लड़कियों के लिए प्रगति छात्रवृत्ति", mr: "मुलींसाठी प्रगती शिष्यवृत्ती" },
    provider: "Government",
    url: "https://www.aicte-india.org/",
    eligibility: { en: ["Girl Students", "Technical Diploma/Degree"], hi: ["छात्राएं", "तकनीकी डिप्लोमा/डिग्री"] },
    benefits: { en: "₹50,000 per year as incidentals for technical education.", hi: "तकनीकी शिक्षा के लिए आकस्मिक खर्च के रूप में प्रति वर्ष ₹50,000।" }
  },
  {
    id: 4,
    title: { en: "HDFC Badhte Kadam Scholarship", hi: "HDFC बढ़ते कदम छात्रवृत्ति" },
    provider: "Private",
    url: "https://www.buddy4study.com/",
    eligibility: { en: ["Students with Disabilities", "Orphaned Students"], hi: ["विकलांग छात्र", "अनाथ छात्र"] },
    benefits: { en: "Financial assistance up to ₹1,00,000 for studies.", hi: "पढ़ाई के लिए ₹1,00,000 तक की वित्तीय सहायता।" }
  },
  {
    id: 5,
    title: { en: "Tata Capital Pankh Scholarship", hi: "टाटा कैपिटल पंख छात्रवृत्ति" },
    provider: "Private",
    url: "https://www.tatacapital.com/",
    eligibility: { en: ["Class 11 to Undergrad", "Income < ₹4L"], hi: ["कक्षा 11 से स्नातक", "आय < ₹4L"] },
    benefits: { en: "Up to 80% of tuition fees covered for deserving students.", hi: "योग्य छात्रों के लिए शिक्षण शुल्क का 80% तक कवर।" }
  },
  {
    id: 6,
    title: { en: "National Means-cum-Merit Scholarship (NMMS)", hi: "राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति" },
    provider: "Government",
    url: "https://scholarships.gov.in/",
    eligibility: { en: ["Class 8 pass", "Parental income < ₹3.5L"], hi: ["कक्षा 8 उत्तीर्ण", "पारिवारिक आय < ₹3.5L"] },
    benefits: { en: "₹12,000 per annum for students of classes 9 to 12.", hi: "कक्षा 9 से 12 के छात्रों के लिए ₹12,000 प्रति वर्ष।" }
  },
  {
    id: 7,
    title: { en: "Sitaram Jindal Foundation Scholarship", hi: "सीताराम जिंदल फाउंडेशन छात्रवृत्ति" },
    provider: "Private",
    url: "https://www.sitaramjindalfoundation.org/",
    eligibility: { en: ["School/College students", "Merit-based"], hi: ["स्कूल/कॉलेज छात्र", "योग्यता आधारित"] },
    benefits: { en: "Monthly stipend ranging from ₹500 to ₹3,200.", hi: "₹500 से ₹3,200 तक का मासिक वजीफा।" }
  }
];
