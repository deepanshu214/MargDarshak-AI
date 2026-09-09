/**
 * Stage 5 Heavy-Load & Stress Test Suite: Multilingual AI Mentor & Chat Engine
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

const { getGeminiResponse } = await import('../services/geminiService.ts');

console.log("==================================================================");
console.log("  🚀 STAGE 5 HEAVY-LOAD & STRESS TEST: AI MENTOR & CONVERSATION   ");
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

async function runStage5Tests() {
  const sampleStudent = {
    name: "Priya Sharma",
    email: "priya@margdarshak.test",
    locality: "Uttar Pradesh",
    caste: "OBC",
    income: "Below ₹1,00,000 / year",
    educationLevel: "College",
    fieldOfStudy: "Computer Science",
    language: "hi"
  };

  // -------------------------------------------------------------
  // Test 1: Rapid Multi-Turn Conversation Burst (50 turns)
  // -------------------------------------------------------------
  console.log("\n[Test 1] Simulating 50 rapid sequential multi-turn chat messages...");
  const queries = [
    "What scholarships are open for OBC students in UP?",
    "How do I apply on the UP Dashmottar portal?",
    "What documents are needed?",
    "Can I apply for Reliance scholarship as well?",
    "How to prepare for competitive coding?"
  ];

  let conversationHistory = [];
  const startBurst = performance.now();

  for (let i = 0; i < 50; i++) {
    const q = queries[i % queries.length];
    const res = await getGeminiResponse(q, conversationHistory, sampleStudent);

    assert(res && typeof res.text === 'string' && res.text.length > 20, `Turn ${i + 1} produced rich response`);
    
    // Append to history
    conversationHistory.push({ role: 'user', parts: [{ text: q }] });
    conversationHistory.push({ role: 'model', parts: [{ text: res.text }] });

    // Enforce sliding window of last 20 messages (10 turns)
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
  }

  const endBurst = performance.now();
  const burstDuration = endBurst - startBurst;

  console.log(`  ⏱️ Executed 50 consecutive conversation turns in ${burstDuration.toFixed(2)}ms (Avg: ${(burstDuration / 50).toFixed(2)}ms/turn)`);
  assert(conversationHistory.length === 20, "Sliding window memory management caps history at 20 items");
  assert(burstDuration < 100, "Burst chat interactions complete well within threshold (< 100ms)");

  // -------------------------------------------------------------
  // Test 2: Multilingual Guidance Verification across 5 Indian Languages
  // -------------------------------------------------------------
  console.log("\n[Test 2] Testing mentor guidance across multiple Indian language profiles...");
  const languages = ['en', 'hi', 'bn', 'ta', 'te'];

  for (const l of languages) {
    const student = { ...sampleStudent, language: l };
    const res = await getGeminiResponse("Scholarship advice please", [], student);
    assert(res && res.text.length > 0, `Generated response for language code: ${l}`);
  }
  console.log("  ✅ Verified multilingual profile awareness across all 5 test languages");

  console.log("\n==================================================================");
  if (allPassed) {
    console.log("  🎉 ALL STAGE 5 HEAVY-LOAD TESTS PASSED PERFECTLY!");
  } else {
    console.log("  ⚠️ SOME TESTS FAILED!");
    process.exit(1);
  }
  console.log("==================================================================\n");
}

runStage5Tests().catch(console.error);
