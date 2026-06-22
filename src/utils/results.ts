import type { ResultId } from "../types";

export const resultThresholds = {
  r3Max: 3,
  r2Max: 6,
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
