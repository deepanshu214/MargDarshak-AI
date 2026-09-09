export interface TestRecord {
  id: string;
  date: string;
  field: string;
  score: number;
  accuracy: number;
  totalQuestions: number;
  breakdown: {
    subjectCorrect: number;
    subjectTotal: number;
    logicalCorrect: number;
    logicalTotal: number;
  };
  attempts?: TestAttempt[];
  analysis?: {
    strengths: string[];
    weaknesses: string[];
    careerFit: string;
    actionPlan: string;
  };
  resources?: {
    name: string;
    description: string;
    link: string;
    type: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  sources?: any[];
}

export interface DocumentStatus {
  id: string;
  label: string;
  isReady: boolean;
  description: string;
}

export interface ResumeData {
  summary: string;
  skills: string[];
  achievements: string[];
  education: {
    institution: string;
    level: string;
    field: string;
  };
  suggestedRoles: string[];
}

export interface ExtractedDocDetails {
  name?: string;
  idNumber?: string;
  category?: string;
  annualIncome?: string;
  issuingState?: string;
  issuingAuthority?: string;
  issueDate?: string;
  validUntil?: string;
  confidenceScore?: number;
  remarks?: string;
}

export interface VerifiedDocument {
  dataUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  documentType?: 'aadhaar' | 'income' | 'caste' | 'marksheet' | 'disability' | 'other';
  extractedDetails?: ExtractedDocDetails;
  aiConfidenceScore?: number;
  verificationMessage?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  authProvider?: 'email' | 'google';
  googleId?: string;
  password?: string;
  phone?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  locality?: string; // State / Region
  district?: string;
  pincode?: string;
  caste?: string; // General, OBC, SC, ST, EWS, Minority
  income?: string; // < 1 Lakh, 1 - 2.5 Lakhs, 2.5 - 5 Lakhs, 5+ Lakhs
  interest?: string;
  educationLevel?: 'School' | 'College';
  schoolGrade?: 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12';
  collegeDegree?: 'Diploma' | 'Undergraduate (UG)' | 'Postgraduate (PG)';
  fieldOfStudy?: string;
  firstGenerationLearner?: boolean;
  hasDisability?: boolean;
  language: string;
  points: number; // XP Points
  badges: string[];
  trustScore?: number; // 0 - 100 calculated trust score
  isVerified: boolean;
  testHistory: TestRecord[];
  answeredQuestionIds: number[]; 
  chatHistory?: ChatMessage[];
  documentChecklist?: Record<string, boolean>;
  resumeData?: ResumeData;
  verifiedDocuments?: Record<string, VerifiedDocument>;
  bookmarkedSchemes?: string[];
  appliedSchemes?: {
    schemeId: string;
    schemeName: string;
    appliedDate: string;
    status: 'Applied' | 'Under Review' | 'Documents Required' | 'Approved' | 'Disbursed';
    applicationRef?: string;
  }[];
}

export interface Question {
  id: number;
  text: Record<string, string>; 
  options: Record<string, string[]>;
  correctAnswerIdx: number; 
  subject: string;
  type: 'theoretical' | 'solving';
  difficulty: 1 | 2 | 3;
  audience: 'School' | 'College' | 'Both';
}

export interface TestAttempt {
  questionId: number;
  chosenOptionIdx: number | null;
  correctAnswerIdx: number;
  isCorrect: boolean;
  subject: string;
}

export interface ScholarshipScheme {
  id: string;
  title: string;
  provider: string;
  type: 'Government' | 'State' | 'CSR' | 'Private';
  state?: string;
  targetCategory: string[]; // General, OBC, SC, ST, EWS, Girls, Minority
  incomeLimit: number; // e.g. 250000 (in INR)
  educationLevel: 'School' | 'College' | 'Both';
  minMarksPercent: number;
  benefits: string;
  amountInr?: number;
  deadline: string;
  isExpiringSoon?: boolean;
  applicationLink: string;
  requiredDocuments: string[];
  description: string;
}
