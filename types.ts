
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
  attempts?: TestAttempt[]; // Added to track answer key
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

export interface VerifiedDocument {
  dataUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  password?: string;
  age?: number;
  locality?: string;
  caste?: string;
  income?: string;
  interest?: string;
  educationLevel?: 'School' | 'College';
  fieldOfStudy?: string;
  language: string;
  points: number;
  badges: string[];
  isVerified: boolean;
  testHistory: TestRecord[];
  answeredQuestionIds: number[]; 
  chatHistory?: ChatMessage[];
  documentChecklist?: Record<string, boolean>;
  resumeData?: ResumeData;
  verifiedDocuments?: Record<string, VerifiedDocument>;
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
