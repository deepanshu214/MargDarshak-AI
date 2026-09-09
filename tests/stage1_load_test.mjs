/**
 * Stage 1 Heavy-Load & Stress Test Suite for MargDarshak AI Storage Engine
 */

import { performance } from 'perf_hooks';

// Setup mock window/localStorage environment for Node.js test execution
const mockStorage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear()
  }
};

// Import database service dynamically
const { databaseService } = await import('../services/databaseService.ts');

console.log("==================================================================");
console.log("  🚀 STAGE 1 HEAVY-LOAD & RESILIENCE TEST SUITE: STORAGE ENGINE  ");
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

async function runStage1LoadTests() {
  databaseService.clearDatabase();

  // -------------------------------------------------------------
  // Test 1: High-Volume User Generation & Batch Ingestion (1,000 users)
  // -------------------------------------------------------------
  console.log("\n[Test 1] Generating and ingesting 1,000 high-detail student profiles...");
  const sampleUsers = [];
  const streams = ['Science PCM', 'Science PCB', 'Commerce', 'Arts', 'Computer Science'];
  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
  const states = ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'West Bengal'];

  for (let i = 1; i <= 1000; i++) {
    sampleUsers.push({
      email: `student${i}@margdarshak.test`,
      name: `Aspirant ${i}`,
      phone: `98765${String(10000 + i).slice(-5)}`,
      educationLevel: i % 2 === 0 ? 'School' : 'College',
      fieldOfStudy: streams[i % streams.length],
      caste: categories[i % categories.length],
      income: i % 3 === 0 ? '< 1 Lakh' : i % 3 === 1 ? '1 - 2.5 Lakhs' : '2.5 - 5 Lakhs',
      locality: states[i % states.length],
      language: 'hi',
      testScore: Math.floor(Math.random() * 100),
      testHistory: [
        {
          id: `test_${i}_1`,
          date: new Date().toISOString(),
          field: streams[i % streams.length],
          score: Math.floor(Math.random() * 90) + 10,
          accuracy: Math.floor(Math.random() * 50) + 50,
          totalQuestions: 30,
          breakdown: { subjectCorrect: 15, subjectTotal: 20, logicalCorrect: 8, logicalTotal: 10 }
        }
      ],
      answeredQuestionIds: [`q_${i}_1`, `q_${i}_2`, `q_${i}_3`],
      verifiedDocuments: {
        income: { status: i % 2 === 0 ? 'verified' : 'pending', uploadedAt: new Date().toISOString(), dataUrl: 'data:image/png;base64,sampleMockData' },
        aadhaar: { status: 'verified', uploadedAt: new Date().toISOString(), dataUrl: 'data:image/png;base64,sampleMockData' }
      }
    });
  }

  const startBatch = performance.now();
  databaseService.batchRegisterUsers(sampleUsers);
  const endBatch = performance.now();
  const batchDuration = endBatch - startBatch;

  console.log(`  ⏱️ Ingested 1,000 complex records in ${batchDuration.toFixed(2)}ms (${(1000 / (batchDuration / 1000)).toFixed(0)} records/sec)`);
  assert(databaseService.getUserCount() === 1000, "Database holds exactly 1,000 student records");
  assert(batchDuration < 150, "Batch write completes well within threshold (< 150ms)");

  // -------------------------------------------------------------
  // Test 2: Rapid Sequential Reads & Single Updates (2,000 operations)
  // -------------------------------------------------------------
  console.log("\n[Test 2] Stress-testing 2,000 rapid sequential reads & updates...");
  const startOps = performance.now();
  for (let i = 1; i <= 1000; i++) {
    const targetEmail = `student${i}@margdarshak.test`;
    const user = databaseService.loginUser(targetEmail);
    if (!user) continue;

    databaseService.updateUser(targetEmail, {
      testScore: user.testScore + 5,
      locality: 'Updated City'
    });
  }
  const endOps = performance.now();
  const opsDuration = endOps - startOps;
  const avgOpTime = opsDuration / 2000;

  console.log(`  ⏱️ 2,000 read & update operations completed in ${opsDuration.toFixed(2)}ms (Avg: ${avgOpTime.toFixed(3)}ms per op)`);
  assert(avgOpTime < 0.5, "Average operation latency is sub-millisecond (< 0.5ms)");

  const verifiedUser = databaseService.loginUser("student500@margdarshak.test");
  assert(verifiedUser && verifiedUser.locality === 'Updated City', "State consistency and mutation fidelity verified");

  // -------------------------------------------------------------
  // Test 3: Large Payload Resilience (Heavy test history & documents)
  // -------------------------------------------------------------
  console.log("\n[Test 3] Testing massive payload resilience (User with 100 tests + answer keys)...");
  const heavyTestHistory = [];
  for (let t = 1; t <= 100; t++) {
    heavyTestHistory.push({
      id: `heavy_test_${t}`,
      date: new Date(Date.now() - t * 86400000).toISOString(),
      field: 'Computer Science',
      score: 85,
      accuracy: 92,
      totalQuestions: 30,
      breakdown: { subjectCorrect: 18, subjectTotal: 20, logicalCorrect: 9, logicalTotal: 10 },
      attempts: Array.from({ length: 30 }, (_, idx) => ({
        questionId: `q_${idx}`,
        selectedOption: 2,
        isCorrect: idx % 4 !== 0,
        timeTakenSec: 45
      }))
    });
  }

  const startHeavy = performance.now();
  databaseService.updateUser("student1@margdarshak.test", {
    testHistory: heavyTestHistory
  });
  const endHeavy = performance.now();

  console.log(`  ⏱️ Heavy payload (100 tests + 3,000 question attempts) persisted in ${(endHeavy - startHeavy).toFixed(2)}ms`);
  const reloaded = databaseService.loginUser("student1@margdarshak.test");
  assert(reloaded.testHistory.length === 100, "Heavy payload loaded without data truncation or corruption");

  // -------------------------------------------------------------
  // Test 4: Leaderboard Aggregation Under Heavy Load (1,000 users)
  // -------------------------------------------------------------
  console.log("\n[Test 4] Leaderboard aggregation and sorting under 1,000 user dataset...");
  const startLeaderboard = performance.now();
  const allUsers = databaseService.getAllUsers();
  const rankedUsers = allUsers
    .slice()
    .sort((a, b) => (b.testScore || 0) - (a.testScore || 0))
    .slice(0, 50);
  const endLeaderboard = performance.now();
  const lbDuration = endLeaderboard - startLeaderboard;

  console.log(`  ⏱️ Aggregated and ranked 1,000 profiles in ${lbDuration.toFixed(2)}ms`);
  assert(rankedUsers.length === 50, "Top 50 leaderboard computed successfully");
  assert(lbDuration < 15, "Leaderboard computation latency is under 15ms");

  console.log("\n==================================================================");
  if (allPassed) {
    console.log("  🎉 ALL STAGE 1 HEAVY-LOAD TESTS PASSED PERFECTLY!");
  } else {
    console.log("  ⚠️ SOME TESTS FAILED!");
    process.exit(1);
  }
  console.log("==================================================================\n");
}

runStage1LoadTests().catch(console.error);
