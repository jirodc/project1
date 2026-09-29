import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeGrade, periodGrade, weightedAverage } from '../src/services/grading.service.js';

const grading = {
  categories: { quiz: 20, assignment: 20, project: 30, examination: 30, participation: 0, other: 0 },
  periods: { prelim: 30, midterm: 30, final: 40 },
};

const score = (period, category, value, maximumScore = 100) => ({ period, category, score: value, maximumScore });

describe('grading service', () => {
  it('weights category percentages', () => {
    // quiz 80% × 20 + exam 90% × 30 → (1600 + 2700) / 50 = 86
    assert.equal(periodGrade([score('prelim', 'quiz', 8, 10), score('prelim', 'examination', 90)], grading.categories), 86);
  });

  it('pools scores within a category before weighting', () => {
    // quizzes: (9 + 5) / (10 + 10) = 70%
    assert.equal(periodGrade([score('prelim', 'quiz', 9, 10), score('prelim', 'quiz', 5, 10)], grading.categories), 70);
  });

  it('ignores zero-weight categories and returns null with no scores', () => {
    assert.equal(periodGrade([score('prelim', 'participation', 10, 10)], grading.categories), null);
    assert.equal(periodGrade([], grading.categories), null);
  });

  it('computes the final rating only when all periods have grades', () => {
    const partial = computeGrade([score('prelim', 'quiz', 88)], grading);
    assert.equal(partial.prelim, 88);
    assert.equal(partial.rating, null);
    assert.equal(partial.remarks, 'In Progress');

    const complete = computeGrade(
      [score('prelim', 'quiz', 88), score('midterm', 'quiz', 90), score('final', 'quiz', 92)],
      grading,
    );
    // 88 × .3 + 90 × .3 + 92 × .4 = 90.2 → 90 → 1.75
    assert.equal(complete.rating, 90);
    assert.equal(complete.point, 1.75);
    assert.equal(complete.remarks, 'Passed');
  });

  it('marks ratings below 75 as failed', () => {
    const failed = computeGrade([score('prelim', 'quiz', 70), score('midterm', 'quiz', 70), score('final', 'quiz', 70)], grading);
    assert.equal(failed.point, 5);
    assert.equal(failed.remarks, 'Failed');
  });

  it('averages grade points by units', () => {
    assert.equal(weightedAverage([{ point: 1.5, units: 3 }, { point: 2, units: 1 }]), 1.63);
  });
});
