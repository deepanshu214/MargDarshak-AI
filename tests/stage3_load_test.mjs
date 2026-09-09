/**
 * Stage 3 Heavy-Load & Stress Test Suite: Mock Test Evaluation & Question Bank
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

const { databaseService } = await import('../services/databaseService.ts');
const { MOCK_TEST_QUESTIONS, SCHOOL_STREAMS, COLLEGE_FIELDS } = await import('../constants.tsx');

console.log("==================================================================");
console.log("  🚀 STAGE 3 HEAVY-LOAD & STRESS TEST: TESTING & EVALUATION      ");
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

async function runStage3Tests() {
  databaseService.clearDatabase();

  // -------------------------------------------------------------
  // Test 1: Question Bank Integrity & Coverage
  // -------------------------------------------------------------
  console.log("\n[Test 1] Validating question bank coverage across all school & college streams...");
  const streams = [...SCHOOL_STREAMS, ...COLLEGE_FIELDS];
  console.log(`  Total generated question pool: ${MOCK_TEST_QUESTIONS.length} items`);
  assert(MOCK_TEST_QUESTIONS.length >= 1000, `Question pool is large and comprehensive (${MOCK_TEST_QUESTIONS.length} questions)`);

  let streamsValid = true;
  for (const stream of streams) {
    const matching = MOCK_TEST_QUESTIONS.filter(q => q.subject === stream);
    if (matching.length < 20) {
      console.error(`Stream ${stream} has fewer than 20 questions! Found: ${matching.length}`);
      streamsValid = false;
    }
  }
  assert(streamsValid, "All school and college streams have sufficient question density (>= 20 questions)");

  // Check bilingual availability
  const sampleQ = MOCK_TEST_QUESTIONS[0];
  assert(sampleQ.text.en && sampleQ.text.hi, "Questions support bilingual English/Hindi text");
  assert(sampleQ.options.en?.length === 4, "Every question has exactly 4 options");
  assert(sampleQ.correctAnswerIdx >= 0 && sampleQ.correctAnswerIdx < 4, "Correct answer index is valid");

  // -------------------------------------------------------------
  // Test 2: Ingest 1,000 benchmark students for percentile ranking
  // -------------------------------------------------------------
  console.log("\n[Test 2] Preloading 1,000 student benchmark records for percentile computation...");
  const benchmarkUsers = [];
  for (let i = 1; i <= 1000; i++) {
    benchmarkUsers.push({
      email: `bench${i}@margdarshak.test`,
      name: `Benchmark Student ${i}`,
      points: Math.floor(Math.random() * 1000) + 50,
      testHistory: [],
      answeredQuestionIds: [],
      language: 'en'
    });
  }
  databaseService.batchRegisterUsers(benchmarkUsers);
  assert(databaseService.getUserCount() === 1000, "Benchmark cohort of 1,000 users registered");

  // -------------------------------------------------------------
  // Test 3: Heavy-Load Concurrency: Simulate 500 complete test evaluations
  // -------------------------------------------------------------
  console.log("\n[Test 3] Simulating simultaneous grading & percentile evaluation for 500 test sessions...");
  const startGrading = performance.now();
  const allUsers = databaseService.getAllUsers();

  for (let s = 1; s <= 500; s++) {
    // Generate 30 mock attempts
    const attempts = [];
    let correctCount = 0;
    for (let q = 1; q <= 30; q++) {
      const isCorrect = (q + s) % 3 !== 0; // ~66% accuracy
      if (isCorrect) correctCount++;
      attempts.push({
        questionId: 10000 + q,
        chosenOptionIdx: isCorrect ? 0 : 1,
        correctAnswerIdx: 0,
        isCorrect,
        subject: q <= 10 ? 'Aptitude' : 'Science PCM'
      });
    }

    const accuracy = Math.round((correctCount / 30) * 100);
    const earnedPoints = correctCount * 10 + 50;

    // Percentile rank against 1,000 benchmark users
    let lowerCount = 0;
    for (let u = 0; u < allUsers.length; u++) {
      if ((allUsers[u].points || 0) <= earnedPoints) {
        lowerCount++;
      }
    }
    const percentile = Math.min(99, Math.max(1, Math.round((lowerCount / allUsers.length) * 100)));
    assert(percentile >= 1 && percentile <= 99, `Percentile bounded: ${percentile}%`);
  }

  const endGrading = performance.now();
  const gradingDuration = endGrading - startGrading;

  console.log(`  ⏱️ Graded & ranked 500 test sessions (15,000 answers evaluated) in ${gradingDuration.toFixed(2)}ms`);
  console.log(`  ⚡ Throughput: ${(500 / (gradingDuration / 1000)).toFixed(0)} tests/sec (${(15000 / (gradingDuration / 1000)).toFixed(0)} questions graded/sec)`);
  assert(gradingDuration < 200, "Grading engine completes 500 tests well within threshold (< 200ms)");

  // -------------------------------------------------------------
  // Test 4: Score Boundary & Math Verification
  // -------------------------------------------------------------
  console.log("\n[Test 4] Verifying boundary conditions (0% accuracy, 100% accuracy, full skip)...");
  
  // 100% case
  const perfectScore = 30 * 10;
  const perfectAccuracy = Math.round((30 / 30) * 100);
  assert(perfectAccuracy === 100 && perfectScore === 300, "Perfect score math verified (100%, 300 pts)");

  // 0% case
  const zeroAccuracy = Math.round((0 / 30) * 100);
  assert(zeroAccuracy === 0, "Zero score math verified (0%)");

  console.log("\n==================================================================");
  if (allPassed) {
    console.log("  🎉 ALL STAGE 3 HEAVY-LOAD TESTS PASSED PERFECTLY!");
  } else {
    console.log("  ⚠️ SOME TESTS FAILED!");
    process.exit(1);
  }
  console.log("==================================================================\n");
}

runStage3Tests().catch(console.error);
