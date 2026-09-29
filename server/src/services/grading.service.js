import { GRADING_PERIODS } from '../models/Subject.js';

/** Percentage rating → grade point, the common Philippine college scale (1.00 is highest). */
export const GRADING_SCALE = [
  { min: 97, max: 100, point: 1.0, description: 'Excellent' },
  { min: 94, max: 96, point: 1.25, description: 'Excellent' },
  { min: 91, max: 93, point: 1.5, description: 'Very Good' },
  { min: 88, max: 90, point: 1.75, description: 'Very Good' },
  { min: 85, max: 87, point: 2.0, description: 'Good' },
  { min: 82, max: 84, point: 2.25, description: 'Good' },
  { min: 79, max: 81, point: 2.5, description: 'Satisfactory' },
  { min: 76, max: 78, point: 2.75, description: 'Satisfactory' },
  { min: 75, max: 75, point: 3.0, description: 'Passing' },
  { min: 0, max: 74, point: 5.0, description: 'Failed' },
];

const round2 = (value) => Math.round(value * 100) / 100;

export const gradePoint = (rating) => GRADING_SCALE.find((step) => rating >= step.min).point;

/**
 * Grade for one period: each category's percentage (total score over total
 * maximum) weighted by the subject's category weights. Categories with no
 * scores yet are left out and the remaining weights are re-normalized, so a
 * missing quiz doesn't count as zero. Returns null when nothing is recorded.
 */
export function periodGrade(scores, categoryWeights) {
  const totals = {};
  for (const { category, score, maximumScore } of scores) {
    totals[category] ??= { score: 0, maximum: 0 };
    totals[category].score += score;
    totals[category].maximum += maximumScore;
  }

  let weighted = 0;
  let weightSum = 0;
  for (const [category, { score, maximum }] of Object.entries(totals)) {
    const weight = categoryWeights[category] ?? 0;
    if (weight <= 0 || maximum <= 0) continue;
    weighted += (score / maximum) * 100 * weight;
    weightSum += weight;
  }

  return weightSum ? round2(weighted / weightSum) : null;
}

/**
 * Period grades plus the final rating, which needs all three periods.
 * `grading` is a subject's `{ categories, periods }` weights.
 */
export function computeGrade(scores, grading) {
  const periods = Object.fromEntries(
    GRADING_PERIODS.map((period) => [
      period,
      periodGrade(
        scores.filter((score) => score.period === period),
        grading.categories,
      ),
    ]),
  );

  const complete = GRADING_PERIODS.every((period) => periods[period] != null);
  const rating = complete
    ? Math.round(GRADING_PERIODS.reduce((total, period) => total + (periods[period] * grading.periods[period]) / 100, 0))
    : null;
  const point = rating == null ? null : gradePoint(rating);

  return {
    ...periods,
    rating,
    point,
    remarks: rating == null ? 'In Progress' : point <= 3 ? 'Passed' : 'Failed',
  };
}

/** General weighted average of grade points, weighted by units. */
export function weightedAverage(rows) {
  const units = rows.reduce((total, row) => total + row.units, 0);
  if (!units) return null;
  return round2(rows.reduce((total, row) => total + row.point * row.units, 0) / units);
}
