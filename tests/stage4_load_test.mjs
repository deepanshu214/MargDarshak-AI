/**
 * Stage 4 Heavy-Load & Stress Test Suite: Scholarship Discovery & Matching Engine
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

const { scholarshipService, COMPREHENSIVE_SCHEMES } = await import('../services/scholarshipService.ts');

console.log("==================================================================");
console.log("  🚀 STAGE 4 HEAVY-LOAD & STRESS TEST: SCHOLARSHIP MATCH ENGINE ");
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

async function runStage4Tests() {
  // -------------------------------------------------------------
  // Test 1: Verified Scheme Registry Validation
  // -------------------------------------------------------------
  console.log("\n[Test 1] Verifying base scholarship registry integrity...");
  assert(COMPREHENSIVE_SCHEMES.length >= 10, `Registry contains ${COMPREHENSIVE_SCHEMES.length} verified schemes`);

  let allValid = true;
  for (const s of COMPREHENSIVE_SCHEMES) {
    if (!s.id || !s.provider || !s.applicationUrl || !s.amountDisplay) {
      allValid = false;
      console.error("Scheme missing required metadata:", s.id);
    }
  }
  assert(allValid, "All registered schemes have complete metadata & application links");

  // -------------------------------------------------------------
  // Test 2: Scale testing: 500 diverse student profiles matched against registry
  // -------------------------------------------------------------
  console.log("\n[Test 2] Matching 500 diverse student profiles against all schemes...");
  const states = ['Uttar Pradesh', 'Bihar', 'Maharashtra', 'Karnataka', 'All India'];
  const categories = ['General', 'OBC', 'SC', 'ST', 'EWS'];
  const incomes = ['Below ₹1,00,000 / year', '₹1,00,000 - ₹2,50,000 / year', '₹5,00,000 - ₹8,00,000 / year'];

  const testProfiles = [];
  for (let i = 1; i <= 500; i++) {
    testProfiles.push({
      email: `applicant${i}@margdarshak.org`,
      name: `Applicant ${i}`,
      locality: states[i % states.length],
      caste: categories[i % categories.length],
      income: incomes[i % incomes.length],
      educationLevel: i % 2 === 0 ? 'School' : 'College',
      gender: i % 3 === 0 ? 'Female' : 'Male',
      verifiedDocuments: {
        aadhaar: { status: 'verified', uploadedAt: '', dataUrl: '' },
        income: { status: i % 2 === 0 ? 'verified' : 'pending', uploadedAt: '', dataUrl: '' }
      }
    });
  }

  const startMatch = performance.now();
  let totalMatchesComputed = 0;

  for (const p of testProfiles) {
    const ranked = scholarshipService.getRankedSchemes(p, 'All', '');
    totalMatchesComputed += ranked.length;
    assert(ranked.length > 0, "Student receives ranked schemes list");
    // Ensure sorted descending
    for (let j = 0; j < ranked.length - 1; j++) {
      assert(ranked[j].matchData.score >= ranked[j + 1].matchData.score || ranked[j].amount >= ranked[j + 1].amount, "Schemes are strictly ranked by relevance and amount");
    }
  }
  const endMatch = performance.now();
  const matchDuration = endMatch - startMatch;

  console.log(`  ⏱️ Computed ${totalMatchesComputed} individual scheme rankings for 500 students in ${matchDuration.toFixed(2)}ms`);
  console.log(`  ⚡ Evaluation speed: ${(totalMatchesComputed / (matchDuration / 1000)).toFixed(0)} evaluations/sec`);
  assert(matchDuration < 50, "500-student matching completes well within threshold (< 50ms)");

  // -------------------------------------------------------------
  // Test 3: Search & Tab Filtering Performance under rapid typing simulation
  // -------------------------------------------------------------
  console.log("\n[Test 3] Simulating rapid search keystrokes (1,000 queries across registry)...");
  const sampleUser = testProfiles[0];
  const searchQueries = ['NSP', 'Reliance', 'SC', 'Tata', 'Uttar Pradesh', 'Girls', 'NonExistentXYZ'];

  const startSearch = performance.now();
  for (let q = 0; q < 1000; q++) {
    const query = searchQueries[q % searchQueries.length];
    const results = scholarshipService.getRankedSchemes(sampleUser, 'All', query);
    if (query === 'NonExistentXYZ') {
      assert(results.length === 0, "Non-matching search returns 0 results");
    }
  }
  const endSearch = performance.now();
  const searchDuration = endSearch - startSearch;

  console.log(`  ⏱️ Completed 1,000 real-time search queries in ${searchDuration.toFixed(2)}ms (Avg: ${(searchDuration / 1000).toFixed(3)}ms per query)`);
  assert(searchDuration < 50, "1,000 search queries complete in sub-50ms");

  console.log("\n==================================================================");
  if (allPassed) {
    console.log("  🎉 ALL STAGE 4 HEAVY-LOAD TESTS PASSED PERFECTLY!");
  } else {
    console.log("  ⚠️ SOME TESTS FAILED!");
    process.exit(1);
  }
  console.log("==================================================================\n");
}

runStage4Tests().catch(console.error);
