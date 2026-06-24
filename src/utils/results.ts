import type { ResultId } from "../types";

export const resultThresholds = {
  r3Max: 9,
  r2Max: 19,
} as const;

export function computeResult(score: number): ResultId {
  if (score <= resultThresholds.r3Max) {
    return "R3";
  }

  if (score <= resultThresholds.r2Max) {
    return "R2";
  }

  return "R1";
}
