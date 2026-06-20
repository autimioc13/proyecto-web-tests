import { anonSupabase as supabase } from '@/lib/supabase/service';
import crypto from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';

/**
 * Generate a unique referral link for a user
 * Format: {BASE_URL}?ref={referralCode}
 */
export function generateReferralLink(userId: string): string {
  // Create a unique referral code based on userId
  // Using SHA256 hash for security and uniqueness
  const hash = crypto
    .createHash('sha256')
    .update(`${userId}-${Date.now()}`)
    .digest('hex')
    .substring(0, 8);

  const referralCode = `ref_${userId}_${hash}`.toLowerCase();

  return `${BASE_URL}?ref=${referralCode}`;
}

/**
 * Track referral when a new user signs up via referral link
 */
export async function trackReferral(
  userId: string,
  referrerId: string,
  referralCode?: string
): Promise<{
  success: boolean;
  bonusXP?: number;
  error?: string;
}> {
  try {
    // Insert referral record
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_user_id: userId,
        referral_code: referralCode || '',
        referred_at: new Date().toISOString(),
        status: 'completed',
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error tracking referral:', referralError);
      return { success: false, error: referralError.message };
    }

    // Award bonus XP to referrer
    const REFERRAL_BONUS_XP = 250;

    // Get referrer's current stats
    const { data: referrerStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', referrerId)
      .single();

    if (referrerStats) {
      const newTotalXP = referrerStats.total_xp + REFERRAL_BONUS_XP;
      const { calculateLevel } = await import('@/lib/db/gamification');

      const newLevel = calculateLevel(newTotalXP);

      await supabase
        .from('user_stats')
        .update({
          total_xp: newTotalXP,
          level: newLevel,
          referrals_completed: (referrerStats.referrals_completed || 0) + 1,
        })
        .eq('user_id', referrerId);
    } else {
      // Create stats for referrer if doesn't exist
      await supabase.from('user_stats').insert({
        user_id: referrerId,
        total_xp: REFERRAL_BONUS_XP,
        level: 1,
        referrals_completed: 1,
        total_quizzes_completed: 0,
        perfect_scores: 0,
        last_activity_date: new Date().toISOString().split('T')[0],
      });
    }

    // Award bonus XP to referred user
    const SIGNUP_BONUS_XP = 100;

    const { data: newUserStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (newUserStats) {
      const newTotalXP = newUserStats.total_xp + SIGNUP_BONUS_XP;
      const { calculateLevel } = await import('@/lib/db/gamification');

      const newLevel = calculateLevel(newTotalXP);

      await supabase
        .from('user_stats')
        .update({
          total_xp: newTotalXP,
          level: newLevel,
          referred_by: referrerId,
        })
        .eq('user_id', userId);
    } else {
      await supabase.from('user_stats').insert({
        user_id: userId,
        total_xp: SIGNUP_BONUS_XP,
        level: 1,
        referred_by: referrerId,
        total_quizzes_completed: 0,
        perfect_scores: 0,
        last_activity_date: new Date().toISOString().split('T')[0],
      });
    }

    return { success: true, bonusXP: REFERRAL_BONUS_XP };
  } catch (error) {
    console.error('Error in trackReferral:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId: string) {
  try {
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('referred_at', { ascending: false });

    const { data: referredBy } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_user_id', userId)
      .single();

    const totalReferrals = referrals?.length || 0;
    const completedReferrals = referrals?.filter((r) => r.status === 'completed').length || 0;
    const pendingReferrals = totalReferrals - completedReferrals;

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      referredByUserId: referredBy?.referrer_id || null,
      referrals: referrals || [],
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      referredByUserId: null,
      referrals: [],
    };
  }
}

/**
 * Validate and extract referrer ID from referral code
 */
export function validateReferralCode(referralCode: string): string | null {
  try {
    if (!referralCode.startsWith('ref_')) {
      return null;
    }

    // Extract userId from code (format: ref_{userId}_{hash})
    const parts = referralCode.split('_');
    if (parts.length < 3) {
      return null;
    }

    return parts[1]; // Return the userId part
  } catch {
    return null;
  }
}

/**
 * Create a short referral link (requires custom domain or shortener service)
 */
export async function createShortReferralLink(userId: string, fullLink: string) {
  try {
    // Store mapping for short link
    // In a real app, you'd use a URL shortener service
    const { data, error } = await supabase
      .from('short_links')
      .insert({
        user_id: userId,
        full_url: fullLink,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating short link:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createShortReferralLink:', error);
    return null;
  }
}

/**
 * Get referral link for a user
 */
export async function getUserReferralLink(userId: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('user_stats')
      .select('referral_link')
      .eq('user_id', userId)
      .single();

    if (data?.referral_link) {
      return data.referral_link;
    }

    // Generate if doesn't exist
    const referralLink = generateReferralLink(userId);

    await supabase
      .from('user_stats')
      .update({ referral_link: referralLink })
      .eq('user_id', userId);

    return referralLink;
  } catch (error) {
    console.error('Error getting user referral link:', error);
    return null;
  }
}
