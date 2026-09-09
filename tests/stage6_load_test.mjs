/**
 * Stage 6 Heavy-Load & Stress Test Suite: Leaderboard at 5,000 Users & Resume Builder
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

const { generateAiResume } = await import('../services/geminiService.ts');

console.log("==================================================================");
console.log("  🚀 STAGE 6 HEAVY-LOAD & STRESS TEST: LEADERBOARD & RESUME      ");
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

async function runStage6Tests() {
  // -------------------------------------------------------------
  // Test 1: Generate & Rank 5,000 Student Profiles on Leaderboard
  // -------------------------------------------------------------
  console.log("\n[Test 1] Generating 5,000 student profiles for extreme scale leaderboard stress test...");
  const states = ['Uttar Pradesh', 'Bihar', 'Maharashtra', 'Karnataka', 'Rajasthan', 'West Bengal', 'Delhi NCR'];
  const testProfiles = [];

  for (let i = 1; i <= 5000; i++) {
    testProfiles.push({
      email: `scholar${i}@margdarshak.org`,
      name: `Scholar Aspirant ${i}`,
      locality: states[i % states.length],
      educationLevel: i % 2 === 0 ? 'School' : 'College',
      fieldOfStudy: i % 3 === 0 ? 'Science PCM' : 'Computer Science',
      points: Math.floor(Math.random() * 5000) + 10,
      testHistory: [
        { accuracy: Math.floor(Math.random() * 50) + 50 }
      ]
    });
  }
  assert(testProfiles.length === 5000, "5,000 synthetic student profiles generated");

  console.log("\n[Test 2] Benchmarking sorting and ranking of 5,000 profiles...");
  const startSort = performance.now();
  const ranked = testProfiles
    .slice()
    .sort((a, b) => b.points - a.points);
  const endSort = performance.now();
  const sortDuration = endSort - startSort;

  console.log(`  ⏱️ Sorted 5,000 profiles in ${sortDuration.toFixed(2)}ms`);
  assert(ranked[0].points >= ranked[1].points, "Top rank holds highest score");
  assert(ranked[ranked.length - 1].points <= ranked[ranked.length - 2].points, "Order preserved to bottom rank");
  assert(sortDuration < 30, "Sorting 5,000 profiles executes in sub-30ms");

  // -------------------------------------------------------------
  // Test 3: Multi-attribute filtering across 5,000 profiles
  // -------------------------------------------------------------
  console.log("\n[Test 3] Benchmarking regional & educational filtering on 5,000 profiles...");
  const startFilter = performance.now();
  const upCollegeScholars = ranked.filter(u => u.locality === 'Uttar Pradesh' && u.educationLevel === 'College');
  const endFilter = performance.now();
  const filterDuration = endFilter - startFilter;

  console.log(`  ⏱️ Filtered 5,000 records (Found ${upCollegeScholars.length} matching) in ${filterDuration.toFixed(2)}ms`);
  assert(upCollegeScholars.length > 0, "Filtered subset retrieved");
  assert(filterDuration < 15, "Filter execution latency is sub-15ms");

  // -------------------------------------------------------------
  // Test 4: AI Resume Generator Batch Verification
  // -------------------------------------------------------------
  console.log("\n[Test 4] Verifying Resume Builder data model and generation engine...");
  const sampleUser = testProfiles[0];
  const resume = await generateAiResume(sampleUser);

  assert(resume !== null, "Resume generated successfully");
  assert(typeof resume.summary === 'string' && resume.summary.length > 30, "Summary is rich and well-structured");
  assert(Array.isArray(resume.skills) && resume.skills.length >= 3, "Skills array populated");
  assert(Array.isArray(resume.achievements) && resume.achievements.length >= 2, "Achievements array populated");
  assert(Array.isArray(resume.suggestedRoles) && resume.suggestedRoles.length >= 2, "Suggested roles populated");
  assert(resume.education && resume.education.institution, "Education model intact");

  console.log("\n==================================================================");
  if (allPassed) {
    console.log("  🎉 ALL STAGE 6 HEAVY-LOAD TESTS PASSED PERFECTLY!");
  } else {
    console.log("  ⚠️ SOME TESTS FAILED!");
    process.exit(1);
  }
  console.log("==================================================================\n");
}

runStage6Tests().catch(console.error);
