/**
 * Calculates the percentage of XP progress towards the next level
 * @param currentXP - User's total XP
 * @param nextLevelXP - XP required to reach the next level
 * @returns Percentage (0-100) of progress to next level
 */
export function calculateXPPercentage(
  currentXP: number,
  nextLevelXP: number
): number {
  if (nextLevelXP <= 0) return 0;

  // Get the XP needed for current level to calculate progress
  const baseXP = 1000;
  const xpGrowth = 1.5;

  // Find current level from total XP
  let currentLevel = 1;
  let cumulativeXP = 0;
  while (cumulativeXP + baseXP * Math.pow(xpGrowth, currentLevel - 1) <= currentXP) {
    cumulativeXP += baseXP * Math.pow(xpGrowth, currentLevel - 1);
    currentLevel++;
  }

  const xpInCurrentLevel = currentXP - cumulativeXP;

  // Calculate percentage of progress in current level
  const percentage = Math.min(100, (xpInCurrentLevel / nextLevelXP) * 100);

  return Math.round(percentage);
}

/**
 * Gets XP information for a user level
 * @param currentLevel - User's current level
 * @returns Object with XP info for the level
 */
export function getLevelXPInfo(currentLevel: number) {
  const baseXP = 1000;
  const xpGrowth = 1.5;

  const xpForNextLevel = Math.round(baseXP * Math.pow(xpGrowth, currentLevel - 1));
  const cumulativeXPForLevel = Math.round(
    baseXP * ((Math.pow(xpGrowth, currentLevel) - 1) / (xpGrowth - 1))
  );

  return {
    currentLevel,
    xpForNextLevel,
    cumulativeXPForLevel,
  };
}

/**
 * Formats XP number for display
 * @param xp - XP amount
 * @returns Formatted string (e.g., "1.2K", "1M")
 */
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}
