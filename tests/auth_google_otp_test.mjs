/**
 * Automated Test Suite: Google OAuth 2.0 & 2FA OTP Authentication Engine
 */

import { performance } from 'perf_hooks';

// Setup mock window/localStorage for databaseService
const mockStorage = new Map();
global.window = {
  localStorage: {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear()
  }
};

const { authService, DEMO_GOOGLE_ACCOUNTS } = await import('../services/authService.ts');
const { databaseService } = await import('../services/databaseService.ts');
const { verifyGmail, sendOtpEmail } = await import('../services/gmailVerifyServer.ts');

console.log("==================================================================");
console.log("  🔐 EXTENSIVE AUDIT: GOOGLE AUTHENTICATION & 2FA OTP ENGINE      ");
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

async function runAuthTests() {
  // -----------------------------------------------------------------
  // 1. DEMO GOOGLE ACCOUNTS & METADATA INTEGRITY
  // -----------------------------------------------------------------
  console.log("\n[Test 1] Validating Google Account Profiles & Structure...");
  assert(DEMO_GOOGLE_ACCOUNTS.length >= 3, `Demo accounts available (${DEMO_GOOGLE_ACCOUNTS.length} accounts)`);
  
  for (const acc of DEMO_GOOGLE_ACCOUNTS) {
    assert(acc.email.endsWith('@gmail.com'), `Account ${acc.name} has valid Gmail address: ${acc.email}`);
    assert(!!acc.picture && acc.picture.startsWith('http'), `Account ${acc.name} has valid picture URL`);
    assert(acc.verified === true, `Account ${acc.name} is verified by Google`);
  }

  // -----------------------------------------------------------------
  // 2. OTP GENERATION, EXPIRY & SECURITY
  // -----------------------------------------------------------------
  console.log("\n[Test 2] Auditing 6-Digit OTP Generation & Expiry...");
  const testEmail = "scholar.tester@gmail.com";
  const otp1 = authService.generateOTP(testEmail, 'google_oauth', DEMO_GOOGLE_ACCOUNTS[0]);
  
  assert(/^\d{6}$/.test(otp1.code), `OTP is exactly 6 numerical digits (${otp1.code})`);
  assert(otp1.expiresAt > Date.now() + 4 * 60 * 1000, "OTP has 5-minute validity window");
  assert(otp1.formattedMessage.includes(otp1.code), "Formatted notification includes code");

  // Check pending retrieval
  const pending = authService.getPendingOTP(testEmail);
  assert(pending !== null && pending.code === otp1.code, "Pending OTP record correctly stored and indexed");

  // -----------------------------------------------------------------
  // 3. OTP VERIFICATION, ATTEMPTS & BYPASS PASSKEY
  // -----------------------------------------------------------------
  console.log("\n[Test 3] Testing OTP Verification, Rate Limiting & Bypass...");
  
  // Test 3A: Wrong code attempt
  const wrongRes = authService.verifyOTP(testEmail, "999999");
  assert(!wrongRes.success && wrongRes.message.includes("remaining"), "Incorrect OTP is rejected with remaining attempts count");

  // Test 3B: Bypass PIN (123456)
  const bypassEmail = "bypass.test@gmail.com";
  authService.generateOTP(bypassEmail, 'google_oauth', DEMO_GOOGLE_ACCOUNTS[1]);
  const bypassRes = authService.verifyOTP(bypassEmail, "123456");
  assert(bypassRes.success, "Universal demo passkey 123456 verifies successfully");

  // Test 3C: Correct generated code verification
  const exactEmail = "exact.match@gmail.com";
  const exactOtp = authService.generateOTP(exactEmail, 'google_oauth', DEMO_GOOGLE_ACCOUNTS[0]);
  const exactRes = authService.verifyOTP(exactEmail, exactOtp.code);
  assert(exactRes.success && exactRes.googleProfile?.email === DEMO_GOOGLE_ACCOUNTS[0].email, "Exact code verifies successfully and returns Google profile");

  // Test 3D: Resend OTP
  const resendEmail = "resend.test@gmail.com";
  const initial = authService.generateOTP(resendEmail, 'google_oauth');
  const resent = authService.resendOTP(resendEmail);
  assert(resent !== null && /^\d{6}$/.test(resent.code), `Resend OTP successfully issues new code (${resent?.code})`);

  // -----------------------------------------------------------------
  // 4. GOOGLE AUTH + DATABASE PERSISTENCE
  // -----------------------------------------------------------------
  console.log("\n[Test 4] Testing Google Profile Registration & Database Persistence...");
  const googleUser = DEMO_GOOGLE_ACCOUNTS[0];
  const registeredUser = authService.completeGoogleAuth(googleUser, 'en');

  assert(registeredUser.email === googleUser.email.toLowerCase(), "Email matches Google identity");
  assert(registeredUser.name === googleUser.name, "Name matches Google identity");
  assert(registeredUser.avatar === googleUser.picture, "Profile picture URL matches Google identity");
  assert(registeredUser.authProvider === 'google', "authProvider is set to 'google'");
  assert(registeredUser.isVerified === true, "User marked as verified");
  assert(registeredUser.points >= 75, `Google authenticated scholar awarded bonus XP (${registeredUser.points} XP)`);
  assert(registeredUser.badges.includes('Google Verified Scholar'), "Google Verified Scholar badge awarded");

  // Verify retrieval from databaseService
  const dbUser = databaseService.loginUser(googleUser.email.toLowerCase());
  assert(dbUser !== null && dbUser.email === googleUser.email.toLowerCase(), "User record persisted and retrievable from database");

  // -----------------------------------------------------------------
  // 5. LIVE GOOGLE MAIL SERVER VERIFICATION & DOMAIN VALIDATION
  // -----------------------------------------------------------------
  console.log("\n[Test 5] Auditing Real-Time Google Mail Server (MX) Verification...");
  
  // Real Gmail test
  const realRes = await verifyGmail("deepanshuagarwal@gmail.com");
  assert(realRes.success && realRes.exists, `Real Gmail verified with Google Mail Servers (${realRes.message})`);

  // Non-existent Gmail test
  const fakeRes = await verifyGmail("definitelynotarealuser884920182@gmail.com");
  assert(!fakeRes.exists, `Non-existent Gmail rejected by Google Mail Servers (${fakeRes.message})`);

  // Invalid domain test
  const invalidDomainRes = await verifyGmail("scholar@nonexistentdomain12398472.com");
  assert(!invalidDomainRes.success, `Non-existent domain rejected (${invalidDomainRes.message})`);

  // -----------------------------------------------------------------
  // 6. HIGH-LOAD STRESS TEST (500 Rapid Google Logins & OTPs)
  // -----------------------------------------------------------------
  console.log("\n[Test 6] Benchmarking 500 Rapid Google Logins with 2FA OTPs...");
  const t0 = performance.now();
  for (let i = 0; i < 500; i++) {
    const acc = {
      id: `google_perf_${i}`,
      name: `Scholar Tester #${i}`,
      email: `scholar.perf.${i}@gmail.com`,
      picture: `https://avatar.test/${i}.png`,
      verified: true
    };
    const otp = authService.generateOTP(acc.email, 'google_oauth', acc);
    const verify = authService.verifyOTP(acc.email, otp.code);
    if (!verify.success) throw new Error(`Failed OTP verification on iteration ${i}`);
    authService.completeGoogleAuth(acc, 'en');
  }
  const t1 = performance.now();
  const duration = (t1 - t0).toFixed(2);
  console.log(`  ⏱️ Generated, verified, and authenticated 500 Google accounts with 2FA OTP in ${duration}ms (Avg: ${(duration / 500).toFixed(3)}ms/auth)`);
  assert(Number(duration) < 500, "500 complete Google OAuth + OTP cycles complete in sub-500ms");

  console.log("\n==================================================================");
  if (allPassed) {
    console.log("  🎉 ALL GOOGLE AUTH & OTP TESTS PASSED WITH 100% SUCCESS!       ");
  } else {
    console.log("  ❌ SOME GOOGLE AUTH & OTP TESTS FAILED!                        ");
  }
  console.log("==================================================================\n");

  if (!allPassed) process.exit(1);
}

runAuthTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
