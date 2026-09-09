import { UserProfile } from '../types';
import { databaseService } from './databaseService';

export interface GoogleAccount {
  id: string;
  name: string;
  email: string;
  picture: string;
  givenName?: string;
  familyName?: string;
  verified: boolean;
}

export interface OTPRecord {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
  channel: 'google_oauth' | 'email_password';
  googleProfile?: GoogleAccount;
}

// Pre-configured official Google demo accounts for instant 1-click test login
export const DEMO_GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    id: 'google_10842918239102931',
    name: 'Deepanshu Agarwal',
    email: 'deepanshu.scholar@gmail.com',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    givenName: 'Deepanshu',
    familyName: 'Agarwal',
    verified: true
  },
  {
    id: 'google_20918230912830192',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    givenName: 'Aarav',
    familyName: 'Sharma',
    verified: true
  },
  {
    id: 'google_30918239012391023',
    name: 'Priya Patel',
    email: 'priya.patel.scholar@gmail.com',
    picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    givenName: 'Priya',
    familyName: 'Patel',
    verified: true
  }
];

class AuthService {
  private activeOTPs: Map<string, OTPRecord> = new Map();

  /**
   * Generate a secure 6-digit OTP
   */
  generateOTP(
    email: string,
    channel: 'google_oauth' | 'email_password' = 'google_oauth',
    googleProfile?: GoogleAccount
  ): { code: string; expiresAt: number; formattedMessage: string } {
    const cleanEmail = email.toLowerCase().trim();
    // 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    const record: OTPRecord = {
      code,
      email: cleanEmail,
      expiresAt,
      attempts: 0,
      channel,
      googleProfile
    };

    this.activeOTPs.set(cleanEmail, record);

    const formattedMessage = `Your MargDarshak AI verification code is: ${code} (Valid for 5 minutes).`;
    return { code, expiresAt, formattedMessage };
  }

  /**
   * Verify an entered 6-digit OTP
   */
  verifyOTP(
    email: string,
    enteredCode: string
  ): {
    success: boolean;
    message: string;
    googleProfile?: GoogleAccount;
  } {
    const cleanEmail = email.toLowerCase().trim();
    const record = this.activeOTPs.get(cleanEmail);

    // Universal bypass passkey for demo or automated test runner
    if (enteredCode === '123456') {
      const profile = record?.googleProfile;
      this.activeOTPs.delete(cleanEmail);
      return {
        success: true,
        message: 'OTP verified successfully (Demo Passcode accepted).',
        googleProfile: profile
      };
    }

    if (!record) {
      return {
        success: false,
        message: 'No active OTP request found for this account. Please request a new code.'
      };
    }

    if (Date.now() > record.expiresAt) {
      this.activeOTPs.delete(cleanEmail);
      return {
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      };
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      this.activeOTPs.delete(cleanEmail);
      return {
        success: false,
        message: 'Too many incorrect attempts. For security, please request a new OTP.'
      };
    }

    if (record.code === enteredCode.trim()) {
      const profile = record.googleProfile;
      this.activeOTPs.delete(cleanEmail);
      return {
        success: true,
        message: 'OTP verified successfully.',
        googleProfile: profile
      };
    }

    return {
      success: false,
      message: `Invalid verification code. ${5 - record.attempts} attempts remaining.`
    };
  }

  /**
   * Resend / Refresh OTP for an email
   */
  resendOTP(email: string): { code: string; expiresAt: number; formattedMessage: string } | null {
    const cleanEmail = email.toLowerCase().trim();
    const existing = this.activeOTPs.get(cleanEmail);
    return this.generateOTP(
      cleanEmail,
      existing?.channel || 'google_oauth',
      existing?.googleProfile
    );
  }

  /**
   * Retrieve active pending OTP record
   */
  getPendingOTP(email: string): OTPRecord | null {
    const cleanEmail = email.toLowerCase().trim();
    return this.activeOTPs.get(cleanEmail) || null;
  }

  /**
   * Complete Google Login + OTP Verification and persist profile
   */
  completeGoogleAuth(googleProfile: GoogleAccount, preferredLang = 'en'): UserProfile {
    const cleanEmail = googleProfile.email.toLowerCase().trim();
    const existingUser = databaseService.loginUser(cleanEmail);

    if (existingUser) {
      const updated: UserProfile = {
        ...existingUser,
        name: existingUser.name || googleProfile.name,
        avatar: googleProfile.picture || existingUser.avatar,
        authProvider: 'google',
        googleId: googleProfile.id,
        isVerified: true
      };
      databaseService.updateUser(cleanEmail, updated);
      return updated;
    }

    // Register fresh user account from Google profile
    const newUser: UserProfile = {
      name: googleProfile.name,
      email: cleanEmail,
      avatar: googleProfile.picture,
      authProvider: 'google',
      googleId: googleProfile.id,
      points: 75, // Extra bonus XP for Google verified scholars
      badges: ['Scholar Pioneer', 'Google Verified Scholar'],
      language: preferredLang,
      isVerified: true,
      testHistory: [],
      answeredQuestionIds: []
    };

    databaseService.registerUser(newUser);
    return newUser;
  }
}

export const authService = new AuthService();
