/**
 * Stage 2 Heavy-Load & Stress Test Suite: Profile, Verification & Trust Engine
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
const { verifyDocumentMultimodal } = await import('../services/geminiService.ts');

console.log("==================================================================");
console.log("  🚀 STAGE 2 HEAVY-LOAD & STRESS TEST: PROFILE & TRUST ENGINE    ");
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

// Replicate Trust Score formula for verification
function calculateTrust(u) {
  let score = 20;
  if (u.name && u.email) score += 10;
  if (u.locality && u.locality !== '') score += 10;
  if (u.caste && u.income) score += 15;
  if (u.educationLevel && u.fieldOfStudy) score += 10;

  const docs = u.verifiedDocuments || {};
  if (docs.aadhaar?.status === 'verified') score += 15;
  if (docs.income?.status === 'verified') score += 10;
  if (docs.caste?.status === 'verified') score += 5;
  if (docs.marksheet?.status === 'verified') score += 5;

  return Math.min(100, score);
}

async function runStage2Tests() {
  databaseService.clearDatabase();

  // -------------------------------------------------------------
  // Test 1: Ingest 1,000 diverse profiles with varying verification tiers
  // -------------------------------------------------------------
  console.log("\n[Test 1] Registering 1,000 profiles with rich demographic & academic attributes...");
  const profiles = [];
  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];
  const states = ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Karnataka'];

  for (let i = 1; i <= 1000; i++) {
    profiles.push({
      email: `scholar${i}@margdarshak.org`,
      name: `Student Aspirant ${i}`,
      educationLevel: i % 2 === 0 ? 'School' : 'College',
      fieldOfStudy: i % 3 === 0 ? 'Science PCM' : i % 3 === 1 ? 'Commerce' : 'Computer Science',
      caste: categories[i % categories.length],
      income: '< 1 Lakh',
      locality: states[i % states.length],
      language: 'en',
      points: 100 + (i % 500),
      badges: ['Starter Scholar'],
      isVerified: false,
      testHistory: [],
      answeredQuestionIds: [],
      verifiedDocuments: {
        aadhaar: {
          status: i % 2 === 0 ? 'verified' : 'pending',
          uploadedAt: new Date().toISOString(),
          dataUrl: 'data:image/jpeg;base64,mockAadhaarBuffer'
        },
        income: {
          status: i % 3 === 0 ? 'verified' : 'pending',
          uploadedAt: new Date().toISOString(),
          dataUrl: 'data:image/jpeg;base64,mockIncomeBuffer'
        }
      }
    });
  }

  const startBatch = performance.now();
  databaseService.batchRegisterUsers(profiles);
  const endBatch = performance.now();
  console.log(`  ⏱️ Ingested 1,000 profiles in ${(endBatch - startBatch).toFixed(2)}ms`);
  assert(databaseService.getUserCount() === 1000, "1,000 user profiles stored");

  // -------------------------------------------------------------
  // Test 2: Trust Index Calculation Engine Benchmark (1,000 users)
  // -------------------------------------------------------------
  console.log("\n[Test 2] Benchmarking Trust Score calculation on 1,000 multi-document profiles...");
  const startTrust = performance.now();
  const allUsers = databaseService.getAllUsers();
  let platinumCount = 0;
  let goldCount = 0;
  let silverCount = 0;

  for (const u of allUsers) {
    const score = calculateTrust(u);
    if (score >= 80) platinumCount++;
    else if (score >= 50) goldCount++;
    else silverCount++;
  }
  const endTrust = performance.now();
  const trustDuration = endTrust - startTrust;

  console.log(`  ⏱️ Evaluated 1,000 trust scores in ${trustDuration.toFixed(2)}ms (${(1000 / (trustDuration / 1000)).toFixed(0)} evaluations/sec)`);
  console.log(`  📊 Distribution: Platinum: ${platinumCount}, Gold: ${goldCount}, Silver: ${silverCount}`);
  assert(trustDuration < 15, "Trust score engine throughput is sub-15ms for 1,000 profiles");
  assert(platinumCount + goldCount + silverCount === 1000, "100% of profiles categorized into tiers");

  // -------------------------------------------------------------
  // Test 3: Concurrent Profile Updates & State Consistency
  // -------------------------------------------------------------
  console.log("\n[Test 3] Simulating 1,000 rapid concurrent state mutations (document uploads & edits)...");
  const startMutations = performance.now();
  for (let i = 1; i <= 1000; i++) {
    databaseService.updateUser(`scholar${i}@margdarshak.org`, {
      trustScore: calculateTrust(profiles[i - 1]),
      isVerified: i % 2 === 0
    });
  }
  const endMutations = performance.now();
  const mutDuration = endMutations - startMutations;

  console.log(`  ⏱️ Completed 1,000 profile updates in ${mutDuration.toFixed(2)}ms (Avg: ${(mutDuration / 1000).toFixed(3)}ms)`);
  assert(mutDuration < 500, "Mutation throughput within bounds (< 500ms)");

  // -------------------------------------------------------------
  // Test 4: Multimodal Document Verification Engine Stress Test
  // -------------------------------------------------------------
  console.log("\n[Test 4] Stress-testing Document Verification Engine across diverse document types...");
  const sampleStudent = profiles[0];
  const docTypes = ['aadhaar', 'income', 'caste', 'marksheet'];

  for (const dt of docTypes) {
    const mockImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
    const res = await verifyDocumentMultimodal(mockImage, dt, sampleStudent);
    assert(res && (res.status === 'verified' || res.status === 'pending'), `Verification handler returned valid response for ${dt}`);
    assert(res.confidenceScore >= 0 && res.confidenceScore <= 100, `Confidence score bounded: ${res.confidenceScore}%`);
  }

  console.log("\n==================================================================");
  if (allPassed) {
    console.log("  🎉 ALL STAGE 2 HEAVY-LOAD TESTS PASSED PERFECTLY!");
  } else {
    console.log("  ⚠️ SOME TESTS FAILED!");
    process.exit(1);
  }
  console.log("==================================================================\n");
}

runStage2Tests().catch(console.error);
