/**
 * Elo Rating System Implementation
 * K-factor = 32
 */

const K = 32;

export function calculateEloChange(ratingA: number, ratingB: number, actualScoreA: number) {
  const expectedScoreA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedScoreB = 1 - expectedScoreA;

  const actualScoreB = 1 - actualScoreA;

  const changeA = Math.round(K * (actualScoreA - expectedScoreA));
  const changeB = Math.round(K * (actualScoreB - expectedScoreB));

  return { changeA, changeB };
}
