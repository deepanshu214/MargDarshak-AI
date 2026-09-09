import { UserProfile } from "../types";

export interface SchemeDefinition {
  id: string;
  title: Record<string, string>;
  provider: string;
  providerType: 'Central Govt' | 'State Govt' | 'Corporate CSR' | 'Trust/Foundation';
  state: string; // 'All India' or specific state
  amount: number;
  amountDisplay: string;
  incomeLimit: number; // Max annual family income in INR
  categories: string[]; // 'General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'
  educationLevel: 'School' | 'College' | 'Both';
  gender: 'All' | 'Female';
  deadline: string;
  applicationUrl: string;
  requiredDocs: string[]; // 'aadhaar', 'income', 'caste', 'marksheet', 'domicile', 'passbook'
  benefits: Record<string, string>;
  description: Record<string, string>;
}

export const COMPREHENSIVE_SCHEMES: SchemeDefinition[] = [
  // CENTRAL GOVERNMENT SCHEMES
  {
    id: "nsp-post-matric-sc",
    title: {
      en: "Post-Matric Scholarship for SC Students",
      hi: "अनुसूचित जाति (SC) के छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति"
    },
    provider: "Ministry of Social Justice & Empowerment",
    providerType: "Central Govt",
    state: "All India",
    amount: 13500,
    amountDisplay: "Full Tuition + ₹13,500/yr Allowance",
    incomeLimit: 250000,
    categories: ["SC"],
    educationLevel: "Both",
    gender: "All",
    deadline: "2026-11-30",
    applicationUrl: "https://scholarships.gov.in/",
    requiredDocs: ["aadhaar", "income", "caste", "marksheet", "passbook"],
    benefits: {
      en: "100% compulsory non-refundable fees reimbursed + monthly maintenance allowance.",
      hi: "100% गैर-वापसी योग्य शिक्षण शुल्क प्रतिपूर्ति + मासिक रखरखाव भत्ता।"
    },
    description: {
      en: "Centrally sponsored scheme for SC students studying post-matriculation or post-secondary stages.",
      hi: "मैट्रिक के बाद की पढ़ाई करने वाले अनुसूचित जाति के छात्रों के लिए केंद्र प्रायोजित प्रमुख योजना।"
    }
  },
  {
    id: "nsp-post-matric-obc",
    title: {
      en: "Post-Matric Scholarship for OBC Students",
      hi: "अन्य पिछड़ा वर्ग (OBC) के छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति"
    },
    provider: "Ministry of Social Justice & Empowerment",
    providerType: "Central Govt",
    state: "All India",
    amount: 10000,
    amountDisplay: "Up to ₹10,000/yr + Tuition",
    incomeLimit: 250000,
    categories: ["OBC", "EWS"],
    educationLevel: "Both",
    gender: "All",
    deadline: "2026-11-30",
    applicationUrl: "https://scholarships.gov.in/",
    requiredDocs: ["aadhaar", "income", "caste", "marksheet", "passbook"],
    benefits: {
      en: "Maintenance allowance and fee reimbursement for higher secondary and college courses.",
      hi: "उच्चतर माध्यमिक और कॉलेज पाठ्यक्रमों के लिए रखरखाव भत्ता और शुल्क प्रतिपूर्ति।"
    },
    description: {
      en: "Financial assistance to enable OBC and EWS students to pursue higher secondary & tertiary education.",
      hi: "ओबीसी और ईडब्ल्यूएस छात्रों को उच्च माध्यमिक और कॉलेज शिक्षा जारी रखने के लिए वित्तीय सहायता।"
    }
  },
  {
    id: "nsp-nmmss",
    title: {
      en: "National Means-cum-Merit Scholarship Scheme (NMMSS)",
      hi: "राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति योजना (NMMSS)"
    },
    provider: "Department of School Education & Literacy",
    providerType: "Central Govt",
    state: "All India",
    amount: 12000,
    amountDisplay: "₹12,000 per annum (₹1,000/mo)",
    incomeLimit: 350000,
    categories: ["General", "OBC", "SC", "ST", "EWS"],
    educationLevel: "School",
    gender: "All",
    deadline: "2026-10-31",
    applicationUrl: "https://scholarships.gov.in/",
    requiredDocs: ["aadhaar", "income", "marksheet", "passbook"],
    benefits: {
      en: "₹1,000 per month deposited directly via DBT to continue studies in Class 9 to 12.",
      hi: "कक्षा 9 से 12 तक की पढ़ाई जारी रखने के लिए ₹1,000 प्रतिमाह सीधे डीबीटी द्वारा।"
    },
    description: {
      en: "Aimed at reducing drop-out rates at class 8 and encouraging economically weaker students to complete high school.",
      hi: "कक्षा 8 में ड्रॉप-आउट दर को रोकने और छात्रों को 12वीं तक पढ़ाई पूरी करने के लिए प्रोत्साहन।"
    }
  },
  {
    id: "aicte-pragati",
    title: {
      en: "AICTE Pragati Scholarship for Girl Students",
      hi: "छात्राओं के लिए एआईसीटीई प्रगति छात्रवृत्ति"
    },
    provider: "All India Council for Technical Education (AICTE)",
    providerType: "Central Govt",
    state: "All India",
    amount: 50000,
    amountDisplay: "₹50,000 per annum",
    incomeLimit: 800000,
    categories: ["General", "OBC", "SC", "ST", "EWS"],
    educationLevel: "College",
    gender: "Female",
    deadline: "2026-12-15",
    applicationUrl: "https://www.aicte-india.org/",
    requiredDocs: ["aadhaar", "income", "marksheet", "passbook"],
    benefits: {
      en: "₹50,000/year lump-sum for tuition fees, books, and laptop/equipment.",
      hi: "ट्यूशन फीस, किताबों और लैपटॉप/उपकरणों के लिए ₹50,000/वर्ष एकमुश्त।"
    },
    description: {
      en: "Empowers young women to pursue advancement in technical diploma and degree programs.",
      hi: "तकनीकी डिप्लोमा और डिग्री कार्यक्रमों में बालिकाओं के सशक्तिकरण के लिए विशेष योजना।"
    }
  },
  {
    id: "dst-inspire",
    title: {
      en: "INSPIRE Scholarship for Higher Education (SHE)",
      hi: "उच्च शिक्षा के लिए इंस्पायर छात्रवृत्ति (DST)"
    },
    provider: "Department of Science & Technology (DST)",
    providerType: "Central Govt",
    state: "All India",
    amount: 80000,
    amountDisplay: "₹80,000 per annum",
    incomeLimit: 1000000,
    categories: ["General", "OBC", "SC", "ST", "EWS"],
    educationLevel: "College",
    gender: "All",
    deadline: "2026-12-31",
    applicationUrl: "https://online-inspire.gov.in/",
    requiredDocs: ["aadhaar", "marksheet", "passbook"],
    benefits: {
      en: "₹60,000 cash scholarship + ₹20,000 summer mentorship research grant.",
      hi: "₹60,000 नकद छात्रवृत्ति + ₹20,000 ग्रीष्मकालीन अनुसंधान अनुदान।"
    },
    description: {
      en: "For meritorious students in top 1% of Class 12 board exams pursuing B.Sc./B.S./Int. M.Sc. in natural and basic sciences.",
      hi: "12वीं बोर्ड में शीर्ष 1% में आने वाले छात्रों के लिए जो बुनियादी विज्ञान में स्नातक कर रहे हैं।"
    }
  },

  // STATE GOVERNMENT SCHEMES
  {
    id: "up-dashmottar",
    title: {
      en: "UP Dashmottar Post-Matric Scholarship",
      hi: "उत्तर प्रदेश दशमोत्तर पोस्ट-मैट्रिक छात्रवृत्ति"
    },
    provider: "Social Welfare Department, Uttar Pradesh",
    providerType: "State Govt",
    state: "Uttar Pradesh",
    amount: 30000,
    amountDisplay: "Full Fee Reimbursement + Monthly Allowance",
    incomeLimit: 250000,
    categories: ["General", "OBC", "SC", "ST", "Minority"],
    educationLevel: "Both",
    gender: "All",
    deadline: "2026-11-20",
    applicationUrl: "https://scholarship.up.gov.in/",
    requiredDocs: ["aadhaar", "income", "caste", "domicile", "marksheet", "passbook"],
    benefits: {
      en: "Complete college tuition fee reimbursement directly into bank account via Aadhaar-linked DBT.",
      hi: "आधार से जुड़े बैंक खाते में पूरी कॉलेज फीस प्रतिपूर्ति।"
    },
    description: {
      en: "Uttar Pradesh government flagship post-matric scholarship for domicile students.",
      hi: "उत्तर प्रदेश के मूल निवासी छात्रों के लिए प्रमुख दशमोत्तर योजना।"
    }
  },
  {
    id: "bihar-post-matric",
    title: {
      en: "Bihar PMS Post-Matric Scholarship (BC/EBC/SC/ST)",
      hi: "बिहार पोस्ट-मैट्रिक छात्रवृत्ति (PMS ऑनलाइन पोर्टल)"
    },
    provider: "Education Department, Govt of Bihar",
    providerType: "State Govt",
    state: "Bihar",
    amount: 25000,
    amountDisplay: "Up to ₹25,000/yr + College Fees",
    incomeLimit: 300000,
    categories: ["OBC", "SC", "ST", "EWS"],
    educationLevel: "Both",
    gender: "All",
    deadline: "2026-11-15",
    applicationUrl: "https://pmsonline.bih.nic.in/",
    requiredDocs: ["aadhaar", "income", "caste", "domicile", "marksheet", "passbook"],
    benefits: {
      en: "Direct DBT transfer of course admission and semester fees.",
      hi: "प्रवेश और सेमेस्टर फीस का सीधा डीबीटी बैंक ट्रांसफर।"
    },
    description: {
      en: "Dedicated state portal for Bihar students enrolled in recognised colleges within or outside Bihar.",
      hi: "बिहार के मान्यता प्राप्त संस्थानों में पढ़ने वाले छात्रों के लिए राज्य छात्रवृत्ति।"
    }
  },
  {
    id: "mahadbt-post-matric",
    title: {
      en: "MahaDBT Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh",
      hi: "महाडीबीटी राजर्षि छत्रपति शाहू महाराज शिक्षण शुल्क प्रतिपूर्ति"
    },
    provider: "Govt of Maharashtra Higher Education Directorate",
    providerType: "State Govt",
    state: "Maharashtra",
    amount: 50000,
    amountDisplay: "50% - 100% Tuition Fee Waiver",
    incomeLimit: 800000,
    categories: ["General", "OBC", "EWS"],
    educationLevel: "College",
    gender: "All",
    deadline: "2026-12-10",
    applicationUrl: "https://mahadbt.maharashtra.gov.in/",
    requiredDocs: ["aadhaar", "income", "domicile", "marksheet", "passbook"],
    benefits: {
      en: "50% to 100% tuition and exam fee reimbursement for professional degree courses.",
      hi: "व्यावसायिक डिग्री पाठ्यक्रमों के लिए 50% से 100% ट्यूशन और परीक्षा शुल्क माफी।"
    },
    description: {
      en: "Provides financial aid to economically weaker students enrolled in engineering, pharmacy, medical, and polytechnic.",
      hi: "इंजीनियरिंग, मेडिकल, और पॉलीटेक्निक में पढ़ने वाले महाराष्ट्र के छात्रों के लिए आर्थिक सहायता।"
    }
  },

  // CORPORATE CSR & FOUNDATION SCHOLARSHIPS
  {
    id: "reliance-foundation-ug",
    title: {
      en: "Reliance Foundation Undergraduate Scholarship",
      hi: "रिलायंस फाउंडेशन अंडरग्रेजुएट छात्रवृत्ति"
    },
    provider: "Reliance Foundation",
    providerType: "Corporate CSR",
    state: "All India",
    amount: 200000,
    amountDisplay: "Up to ₹2,00,000 for entire degree",
    incomeLimit: 1500000,
    categories: ["General", "OBC", "SC", "ST", "EWS"],
    educationLevel: "College",
    gender: "All",
    deadline: "2026-10-15",
    applicationUrl: "https://www.reliancefoundation.org/",
    requiredDocs: ["aadhaar", "income", "marksheet", "passbook"],
    benefits: {
      en: "Financial grant up to ₹2 Lakhs + access to leadership workshops and alumni network.",
      hi: "₹2 लाख तक का वित्तीय अनुदान + नेतृत्व कार्यशालाएं और पूर्व छात्र नेटवर्क।"
    },
    description: {
      en: "Prestigious merit-cum-means scholarship for 5,000 first-year undergraduate students across India.",
      hi: "भारत भर के 5,000 मेधावी स्नातक प्रथम वर्ष के छात्रों के लिए प्रतिष्ठित सीएसआर छात्रवृत्ति।"
    }
  },
  {
    id: "hdfc-badhte-kadam",
    title: {
      en: "HDFC Bank Parivartan's Badhte Kadam Scholarship",
      hi: "एचडीएफसी बैंक परिवर्तन बढ़ते कदम छात्रवृत्ति"
    },
    provider: "HDFC Bank CSR",
    providerType: "Corporate CSR",
    state: "All India",
    amount: 75000,
    amountDisplay: "Up to ₹75,000 per year",
    incomeLimit: 600000,
    categories: ["General", "OBC", "SC", "ST", "EWS"],
    educationLevel: "Both",
    gender: "All",
    deadline: "2026-11-10",
    applicationUrl: "https://www.buddy4study.com/page/hdfc-bank-parivartans-badhte-kadam-scholarship",
    requiredDocs: ["aadhaar", "income", "marksheet", "passbook"],
    benefits: {
      en: "Covers institutional fees, hostel accommodation, and study material expenses.",
      hi: "संस्थान की फीस, छात्रावास खर्च और अध्ययन सामग्री का खर्च कवर करता है।"
    },
    description: {
      en: "Supports students going through economic hardships or crisis situations (single parents, disaster-affected).",
      hi: "आर्थिक संकट या कठिन परिस्थितियों से गुजर रहे छात्रों के लिए एचडीएफसी बैंक की सहायता पहल।"
    }
  },
  {
    id: "tata-trust-scholarship",
    title: {
      en: "Tata Trusts Means and Merit Grant",
      hi: "टाटा ट्रस्ट्स साधन और योग्यता अनुदान"
    },
    provider: "Sir Ratan Tata Trust & Allied Trusts",
    providerType: "Corporate CSR",
    state: "All India",
    amount: 60000,
    amountDisplay: "Up to 80% College Fees Covered",
    incomeLimit: 450000,
    categories: ["General", "OBC", "SC", "ST", "EWS"],
    educationLevel: "College",
    gender: "All",
    deadline: "2026-12-01",
    applicationUrl: "https://www.tatatrusts.org/",
    requiredDocs: ["aadhaar", "income", "marksheet", "passbook"],
    benefits: {
      en: "Direct payment of college semester fees for students maintaining 65%+ academic score.",
      hi: "65%+ अंक बनाए रखने वाले छात्रों के लिए कॉलेज सेमेस्टर शुल्क का सीधा भुगतान।"
    },
    description: {
      en: "Centuries-old philanthropic grant helping underprivileged students achieve higher academic excellence.",
      hi: "जरूरतमंद छात्रों की उच्च शिक्षा के लिए टाटा ट्रस्ट का प्रतिष्ठित अनुदान।"
    }
  },
  {
    id: "ongc-foundation-scholarship",
    title: {
      en: "ONGC Foundation Merit Scholarship for SC/ST/OBC/EWS",
      hi: "ओएनजीसी फाउंडेशन मेरिट स्कॉलरशिप"
    },
    provider: "Oil and Natural Gas Corporation (ONGC)",
    providerType: "Corporate CSR",
    state: "All India",
    amount: 48000,
    amountDisplay: "₹48,000 per year (₹4,000/mo)",
    incomeLimit: 200000,
    categories: ["OBC", "SC", "ST", "EWS"],
    educationLevel: "College",
    gender: "All",
    deadline: "2026-11-25",
    applicationUrl: "https://ongcscholar.org/",
    requiredDocs: ["aadhaar", "income", "caste", "marksheet", "passbook"],
    benefits: {
      en: "Annual stipend of ₹48,000 for Engineering, MBBS, Geology, and MBA programs.",
      hi: "इंजीनियरिंग, एमबीबीएस और एमबीए के लिए ₹48,000 वार्षिक वजीफा।"
    },
    description: {
      en: "Supports 2,000 top underprivileged students in premier professional degree courses across India.",
      hi: "भारत भर में पेशेवर डिग्री पाठ्यक्रमों में पढ़ने वाले 2,000 छात्रों के लिए ओएनजीसी की पहल।"
    }
  }
];

export const scholarshipService = {
  /**
   * Calculate eligibility match score between 0 and 100
   */
  calculateMatchScore: (scheme: SchemeDefinition, user: UserProfile): {
    score: number;
    isEligible: boolean;
    reasons: string[];
    missingCriteria: string[];
    docsReadyCount: number;
  } => {
    let score = 50;
    const reasons: string[] = [];
    const missingCriteria: string[] = [];

    // 1. Education Level check
    if (scheme.educationLevel === 'Both' || scheme.educationLevel === user.educationLevel) {
      score += 15;
      reasons.push(`Matches your current ${user.educationLevel || 'School'} stage`);
    } else {
      missingCriteria.push(`Requires ${scheme.educationLevel} enrollment`);
      score -= 30;
    }

    // 2. Domicile State check
    if (scheme.state === 'All India' || scheme.state === user.locality) {
      score += 15;
      reasons.push(scheme.state === 'All India' ? "Open to students nationwide" : `Eligible for ${user.locality} residents`);
    } else {
      missingCriteria.push(`Restricted to ${scheme.state} domicile`);
      score -= 35;
    }

    // 3. Category / Caste check
    const userCategory = user.caste || 'General';
    const matchesCategory = scheme.categories.some(c => 
      userCategory.toLowerCase().includes(c.toLowerCase()) || 
      c.toLowerCase() === 'general'
    );
    if (matchesCategory) {
      score += 10;
      reasons.push(`Open to ${userCategory} category`);
    } else {
      missingCriteria.push(`Targeted to ${scheme.categories.join(', ')} categories`);
      score -= 20;
    }

    // 4. Income check
    const userIncomeNum = parseIncomeNumber(user.income);
    if (userIncomeNum <= scheme.incomeLimit) {
      score += 10;
      reasons.push(`Your family income is well within the ₹${(scheme.incomeLimit / 100000).toFixed(1)}L ceiling`);
    } else {
      missingCriteria.push(`Family income exceeds ₹${(scheme.incomeLimit / 100000).toFixed(1)}L ceiling`);
      score -= 25;
    }

    // 5. Gender check
    if (scheme.gender === 'Female' && user.gender !== 'Female') {
      missingCriteria.push("Exclusive scholarship for female applicants");
      score -= 40;
    }

    // 6. Document readiness check
    const verifiedDocs = user.verifiedDocuments || {};
    let docsReadyCount = 0;
    for (const docId of scheme.requiredDocs) {
      if (verifiedDocs[docId]?.status === 'verified') {
        docsReadyCount++;
      }
    }

    const finalScore = Math.max(0, Math.min(100, score));
    const isEligible = missingCriteria.length === 0 && finalScore >= 60;

    return {
      score: finalScore,
      isEligible,
      reasons,
      missingCriteria,
      docsReadyCount
    };
  },

  /**
   * Filter and rank all schemes for a student
   */
  getRankedSchemes: (
    user: UserProfile, 
    filter: 'All' | 'Central Govt' | 'State Govt' | 'Corporate CSR' | 'Bookmarked' = 'All',
    searchQuery = ""
  ): (SchemeDefinition & { matchData: ReturnType<typeof scholarshipService.calculateMatchScore> })[] => {
    const bookmarkedSet = new Set(user.bookmarkedSchemes || []);
    const q = searchQuery.trim().toLowerCase();

    return COMPREHENSIVE_SCHEMES
      .map(scheme => ({
        ...scheme,
        matchData: scholarshipService.calculateMatchScore(scheme, user)
      }))
      .filter(item => {
        // Tab Filter
        if (filter === 'Bookmarked' && !bookmarkedSet.has(item.id)) return false;
        if (filter !== 'All' && filter !== 'Bookmarked' && item.providerType !== filter) return false;

        // Search Filter
        if (q) {
          const titleEn = item.title.en?.toLowerCase() || "";
          const titleHi = item.title.hi?.toLowerCase() || "";
          const provider = item.provider.toLowerCase();
          const state = item.state.toLowerCase();
          if (!titleEn.includes(q) && !titleHi.includes(q) && !provider.includes(q) && !state.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by match score descending, then by amount descending
        if (b.matchData.score !== a.matchData.score) {
          return b.matchData.score - a.matchData.score;
        }
        return b.amount - a.amount;
      });
  }
};

function parseIncomeNumber(incomeStr?: string): number {
  if (!incomeStr) return 150000;
  if (incomeStr.includes('Below ₹1,00,000') || incomeStr.includes('< 1 Lakh')) return 80000;
  if (incomeStr.includes('1 - 2.5 Lakhs') || incomeStr.includes('1,00,000 - ₹2,50,000')) return 180000;
  if (incomeStr.includes('2.5 - 5 Lakhs') || incomeStr.includes('2,50,000 - ₹5,00,000')) return 350000;
  if (incomeStr.includes('5,00,000 - ₹8,00,000')) return 650000;
  return 1000000;
}
