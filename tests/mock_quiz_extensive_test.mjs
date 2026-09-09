/**
 * Extensive Test Suite: Mock Quiz Question Uniqueness, Category Filtering & Stress Test
 */

import { performance } from 'perf_hooks';

// Setup mock window/localStorage
const mockStorage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear()
  }
};

const { mockTestService, MOCK_TEST_QUESTIONS } = await import('../services/mockTestService.ts');
const { SCHOOL_STREAMS, COLLEGE_FIELDS } = await import('../services/questionBank.ts');

console.log("==================================================================");
console.log("  🧪 EXTENSIVE MOCK QUIZ AUDIT: UNIQUENESS & CATEGORY ISOLATION   ");
console.log("==================================================================");

let allPassed = true;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    allPassed = false;
  } else {
    console.log(`  ✅ PASSED: ${message}`);
  }
}

async function runExtensiveMockQuizTests() {
  // -----------------------------------------------------------------
  // 1. QUESTION BANK COMPREHENSIVE INTEGRITY & UNIQUENESS
  // -----------------------------------------------------------------
  console.log("\n[Test 1] Validating Entire Question Bank Structure & Uniqueness...");
  console.log(`  Total question count in bank: ${MOCK_TEST_QUESTIONS.length}`);
  assert(MOCK_TEST_QUESTIONS.length >= 1000, `Pool is extensive (${MOCK_TEST_QUESTIONS.length} >= 1000 questions)`);

  // Check 1A: Absolute Uniqueness of Question IDs
  const idSet = new Set();
  const duplicateIds = [];
  for (const q of MOCK_TEST_QUESTIONS) {
    if (idSet.has(q.id)) {
      duplicateIds.push(q.id);
    }
    idSet.add(q.id);
  }
  assert(duplicateIds.length === 0, `All question IDs are strictly unique (0 duplicate IDs, found ${duplicateIds.length})`);

  // Check 1B: Valid Options & Non-Empty Content
  let validOptions = true;
  let hasUniqueOptions = true;
  let validLanguages = true;
  const answerIndexDistribution = [0, 0, 0, 0];

  for (const q of MOCK_TEST_QUESTIONS) {
    if (!q.text.en || !q.text.hi) validLanguages = false;
    if (!q.options.en || q.options.en.length !== 4) validOptions = false;
    if (!q.options.hi || q.options.hi.length !== 4) validOptions = false;

    // Check no duplicate options within the same question
    const uniqueEnOpts = new Set(q.options.en);
    if (uniqueEnOpts.size !== 4) hasUniqueOptions = false;

    // Check answer index
    if (q.correctAnswerIdx >= 0 && q.correctAnswerIdx <= 3) {
      answerIndexDistribution[q.correctAnswerIdx]++;
    } else {
      validOptions = false;
    }
  }

  assert(validLanguages, "All questions possess valid bilingual text (English + Hindi)");
  assert(validOptions, "All questions contain exactly 4 options with valid answer indices (0-3)");
  assert(hasUniqueOptions, "No question has duplicate options among its 4 choices");

  console.log(`  Correct Answer Distribution across Options: [A: ${answerIndexDistribution[0]}, B: ${answerIndexDistribution[1]}, C: ${answerIndexDistribution[2]}, D: ${answerIndexDistribution[3]}]`);
  assert(
    answerIndexDistribution[0] > 0 && 
    answerIndexDistribution[1] > 0 && 
    answerIndexDistribution[2] > 0 && 
    answerIndexDistribution[3] > 0, 
    "Correct answer index is well distributed across all 4 positions (not locked to Option A)"
  );

  // -----------------------------------------------------------------
  // 2. CATEGORY DENSITY & ISOLATION
  // -----------------------------------------------------------------
  console.log("\n[Test 2] Auditing Question Density across Categories & Streams...");
  
  // Aptitude
  const aptitudeQuestions = MOCK_TEST_QUESTIONS.filter(q => q.subject === 'Aptitude');
  console.log(`  Aptitude pool size: ${aptitudeQuestions.length}`);
  assert(aptitudeQuestions.length >= 100, `Aptitude pool is robust (${aptitudeQuestions.length} >= 100)`);

  const allCategories = [
    ...SCHOOL_STREAMS.map(s => ({ stream: s, level: 'School' })),
    ...COLLEGE_FIELDS.map(f => ({ stream: f, level: 'College' }))
  ];

  let allStreamsSufficient = true;
  for (const { stream, level } of allCategories) {
    const matching = MOCK_TEST_QUESTIONS.filter(q => q.subject === stream);
    console.log(`  Stream: [${level}] ${stream} -> ${matching.length} questions`);
    if (matching.length < 50) {
      console.error(`  ❌ Stream '${stream}' has only ${matching.length} questions (< 50)!`);
      allStreamsSufficient = false;
    }
  }
  assert(allStreamsSufficient, "Every single school stream and college field has >= 50 questions");

  // -----------------------------------------------------------------
  // 3. SESSION GENERATION: EXACTNESS & STRICT CATEGORY FILTERING
  // -----------------------------------------------------------------
  console.log("\n[Test 3] Testing Mock Quiz Session Generation for EVERY Stream...");
  let allSessionsValid = true;

  for (const { stream, level } of allCategories) {
    const session = mockTestService.generateTestSession({
      fieldOfStudy: stream,
      educationLevel: level,
      totalQuestions: 30,
      aptitudeCount: 10,
      subjectCount: 20
    });

    // A. Length verification
    if (session.length !== 30) {
      console.error(`Session for ${stream} has length ${session.length} instead of 30!`);
      allSessionsValid = false;
    }

    // B. Intra-session uniqueness
    const sessionIds = new Set(session.map(q => q.id));
    if (sessionIds.size !== 30) {
      console.error(`Session for ${stream} contains duplicate question IDs! Unique: ${sessionIds.size}/30`);
      allSessionsValid = false;
    }

    const sessionTexts = new Set(session.map(q => q.text.en));
    if (sessionTexts.size !== 30) {
      console.error(`Session for ${stream} contains duplicate question texts! Unique: ${sessionTexts.size}/30`);
      allSessionsValid = false;
    }

    // C. Subject isolation
    const aptCount = session.filter(q => q.subject === 'Aptitude').length;
    const subjCount = session.filter(q => q.subject === stream).length;
    const alienQuestions = session.filter(q => q.subject !== 'Aptitude' && q.subject !== stream);

    if (aptCount !== 10) {
      console.error(`Session for ${stream} has ${aptCount} aptitude questions instead of 10!`);
      allSessionsValid = false;
    }

    if (subjCount !== 20) {
      console.error(`Session for ${stream} has ${subjCount} subject questions instead of 20!`);
      allSessionsValid = false;
    }

    if (alienQuestions.length > 0) {
      console.error(`Session for ${stream} contains alien questions from other subjects:`, alienQuestions.map(q => q.subject));
      allSessionsValid = false;
    }
  }

  assert(allSessionsValid, "All generated test sessions contain exactly 10 Aptitude + 20 Subject questions with 0 alien subjects and 0 duplicates");

  // -----------------------------------------------------------------
  // 4. MEMORY & EXHAUSTION STRESS TEST (Repeated Quizzes in Same Subject)
  // -----------------------------------------------------------------
  console.log("\n[Test 4] Simulating Student taking 15 consecutive tests in 'Engineering' (450 questions)...");
  const answeredTracker = new Set();
  let repeatedTestsValid = true;

  for (let testRound = 1; testRound <= 15; testRound++) {
    const session = mockTestService.generateTestSession({
      fieldOfStudy: "Engineering",
      educationLevel: "College",
      answeredQuestionIds: answeredTracker,
      totalQuestions: 30,
      aptitudeCount: 10,
      subjectCount: 20
    });

    if (session.length !== 30) {
      console.error(`Round ${testRound}: Session short! Length: ${session.length}`);
      repeatedTestsValid = false;
    }

    const uniqueInSession = new Set(session.map(q => q.id));
    if (uniqueInSession.size !== 30) {
      console.error(`Round ${testRound}: Intra-session duplicates detected! (${uniqueInSession.size}/30)`);
      repeatedTestsValid = false;
    }

    // Record answered IDs for next round
    session.forEach(q => answeredTracker.add(q.id));
  }

  assert(repeatedTestsValid, `15 consecutive mock test rounds successfully generated 30 unique questions per session, smoothly handling pool exhaustion`);
  console.log(`  Total accumulated answered questions tracked: ${answeredTracker.size}`);

  // -----------------------------------------------------------------
  // 5. HIGH-LOAD BENCHMARK: GENERATE 1,000 SESSIONS
  // -----------------------------------------------------------------
  console.log("\n[Test 5] Benchmarking 1,000 rapid test session generations across random categories...");
  const benchStart = performance.now();

  for (let i = 0; i < 1000; i++) {
    const randomCategory = allCategories[i % allCategories.length];
    const session = mockTestService.generateTestSession({
      fieldOfStudy: randomCategory.stream,
      educationLevel: randomCategory.level,
      totalQuestions: 30
    });
    if (session.length !== 30) {
      allPassed = false;
    }
  }

  const benchDuration = performance.now() - benchStart;
  console.log(`  ⏱️ Generated 1,000 mock quiz sessions (30,000 questions selected & verified) in ${benchDuration.toFixed(2)}ms`);
  console.log(`  Avg latency per session generation: ${(benchDuration / 1000).toFixed(3)}ms`);
  assert(benchDuration < 500, "1,000 mock quiz sessions generated in sub-500ms");

  // -----------------------------------------------------------------
  // FINAL RESULT
  // -----------------------------------------------------------------
  console.log("\n==================================================================");
  if (allPassed) {
    console.log("  🎉 ALL EXTENSIVE MOCK QUIZ TESTS PASSED WITH 100% SUCCESS!     ");
  } else {
    console.error("  ❌ SOME EXTENSIVE MOCK QUIZ TESTS FAILED!                      ");
  }
  console.log("==================================================================\n");

  if (!allPassed) {
    process.exit(1);
  }
}

runExtensiveMockQuizTests().catch(err => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
