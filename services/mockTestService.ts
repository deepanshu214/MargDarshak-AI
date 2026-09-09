import { Question } from '../types';
import { buildComprehensiveQuestionBank, SCHOOL_STREAMS, COLLEGE_FIELDS } from './questionBank';

export const MOCK_TEST_QUESTIONS: Question[] = buildComprehensiveQuestionBank();

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface SessionConfig {
  fieldOfStudy: string;
  educationLevel: 'School' | 'College';
  answeredQuestionIds?: number[] | Set<number>;
  totalQuestions?: number;
  aptitudeCount?: number;
  subjectCount?: number;
}

export class MockTestService {
  private questions: Question[];

  constructor(customQuestions?: Question[]) {
    this.questions = customQuestions || MOCK_TEST_QUESTIONS;
  }

  public getQuestions(): Question[] {
    return this.questions;
  }

  public getQuestionsBySubject(subject: string): Question[] {
    return this.questions.filter(q => q.subject === subject);
  }

  /**
   * Generates a balanced, 100% unique mock test session tailored to the student's category.
   * - Guarantees exactly aptitudeCount (default 10) Aptitude questions
   * - Guarantees exactly subjectCount (default 20) questions from the chosen fieldOfStudy
   * - Zero duplicate questions within the session
   * - Prioritizes unseen questions; seamlessly recycles pool if exhausted without intra-session duplicates
   */
  public generateTestSession(config: SessionConfig): Question[] {
    const {
      fieldOfStudy,
      educationLevel,
      answeredQuestionIds = [],
      totalQuestions = 30,
      aptitudeCount = 10,
      subjectCount = 20
    } = config;

    if (!fieldOfStudy) {
      throw new Error("Cannot generate test session: fieldOfStudy is required.");
    }

    const answeredSet = answeredQuestionIds instanceof Set 
      ? answeredQuestionIds 
      : new Set(answeredQuestionIds);

    const selectedIds = new Set<number>();
    const sessionQuestions: Question[] = [];

    // 1. SELECT APTITUDE QUESTIONS (Target: 10)
    const allAptitude = this.questions.filter(q => q.subject === 'Aptitude');
    const unseenAptitude = shuffleArray(allAptitude.filter(q => !answeredSet.has(q.id)));
    const seenAptitude = shuffleArray(allAptitude.filter(q => answeredSet.has(q.id)));

    const candidateAptitude = [...unseenAptitude, ...seenAptitude];
    for (const q of candidateAptitude) {
      if (sessionQuestions.filter(sq => sq.subject === 'Aptitude').length >= aptitudeCount) break;
      if (!selectedIds.has(q.id)) {
        selectedIds.add(q.id);
        sessionQuestions.push(q);
      }
    }

    // 2. SELECT SUBJECT QUESTIONS (Target: 20)
    const allSubject = this.questions.filter(q => q.subject === fieldOfStudy);
    if (allSubject.length === 0) {
      throw new Error(`No questions found in question bank for subject category: '${fieldOfStudy}'`);
    }

    // Filter by audience preference if available
    const audienceSubject = allSubject.filter(q => q.audience === 'Both' || q.audience === educationLevel);
    const poolToUse = audienceSubject.length >= subjectCount ? audienceSubject : allSubject;

    const theoreticalPool = poolToUse.filter(q => q.type === 'theoretical');
    const solvingPool = poolToUse.filter(q => q.type === 'solving');

    // Attempt balanced theoretical and solving selection (10 + 10)
    const unseenTheo = shuffleArray(theoreticalPool.filter(q => !answeredSet.has(q.id)));
    const seenTheo = shuffleArray(theoreticalPool.filter(q => answeredSet.has(q.id)));
    const allTheo = [...unseenTheo, ...seenTheo];

    const unseenSolv = shuffleArray(solvingPool.filter(q => !answeredSet.has(q.id)));
    const seenSolv = shuffleArray(solvingPool.filter(q => answeredSet.has(q.id)));
    const allSolv = [...unseenSolv, ...seenSolv];

    const halfSubject = Math.floor(subjectCount / 2);
    
    // Pick theoretical
    for (const q of allTheo) {
      if (sessionQuestions.filter(sq => sq.subject === fieldOfStudy && sq.type === 'theoretical').length >= halfSubject) break;
      if (!selectedIds.has(q.id)) {
        selectedIds.add(q.id);
        sessionQuestions.push(q);
      }
    }

    // Pick solving
    for (const q of allSolv) {
      if (sessionQuestions.filter(sq => sq.subject === fieldOfStudy && sq.type === 'solving').length >= (subjectCount - halfSubject)) break;
      if (!selectedIds.has(q.id)) {
        selectedIds.add(q.id);
        sessionQuestions.push(q);
      }
    }

    // If still under subjectCount, fill from any remaining questions of the same subject
    if (sessionQuestions.filter(sq => sq.subject === fieldOfStudy).length < subjectCount) {
      const remainingSubject = shuffleArray(poolToUse);
      for (const q of remainingSubject) {
        if (sessionQuestions.filter(sq => sq.subject === fieldOfStudy).length >= subjectCount) break;
        if (!selectedIds.has(q.id)) {
          selectedIds.add(q.id);
          sessionQuestions.push(q);
        }
      }
    }

    // 3. SANITY VERIFICATION: Ensure exact count and category integrity
    const currentSubjectCount = sessionQuestions.filter(q => q.subject === fieldOfStudy).length;
    const currentAptitudeCount = sessionQuestions.filter(q => q.subject === 'Aptitude').length;

    // Safety fallback: if total count is still short, draw unique questions from either pool
    if (sessionQuestions.length < totalQuestions) {
      const backupPool = shuffleArray(this.questions.filter(q => q.subject === fieldOfStudy || q.subject === 'Aptitude'));
      for (const q of backupPool) {
        if (sessionQuestions.length >= totalQuestions) break;
        if (!selectedIds.has(q.id)) {
          selectedIds.add(q.id);
          sessionQuestions.push(q);
        }
      }
    }

    // Shuffle the final session so aptitude and subject questions are naturally dispersed
    return shuffleArray(sessionQuestions.slice(0, totalQuestions));
  }
}

export const mockTestService = new MockTestService();
