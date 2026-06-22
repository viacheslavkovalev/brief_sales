import { useEffect, useMemo, useState } from "react";
import { questions } from "../data/quiz";
import type { AppState, ResultId, Screen } from "../types";
import { computeResult } from "../utils/results";

const storageKeys = {
  email: "bs_email",
  answers: "bs_answers",
  score: "bs_score",
  result: "bs_result",
} as const;

const initialState: AppState = {
  screen: "intro",
  email: "",
  answers: {},
  score: 0,
  result: null,
};

function getStoredResult(value: string | null): ResultId | null {
  return value === "R1" || value === "R2" || value === "R3" ? value : null;
}

function getNextScreen(email: string, answers: Record<string, string>, result: ResultId | null): Screen {
  if (result) {
    return "result";
  }

  if (!email) {
    return "intro";
  }

  const nextQuestion = questions.find((question) => !answers[question.id]);
  return nextQuestion?.id ?? "result";
}

function readStoredState(): AppState {
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const email = window.localStorage.getItem(storageKeys.email) ?? "";
    const answers = JSON.parse(window.localStorage.getItem(storageKeys.answers) ?? "{}") as Record<string, string>;
    const storedScore = Number(window.localStorage.getItem(storageKeys.score) ?? "0");
    const result = getStoredResult(window.localStorage.getItem(storageKeys.result));
    const score = Number.isFinite(storedScore) ? storedScore : 0;

    return {
      screen: getNextScreen(email, answers, result),
      email,
      answers,
      score,
      result,
    };
  } catch {
    return initialState;
  }
}

export function usePersistentAppState() {
  const [state, setState] = useState<AppState>(() => readStoredState());

  useEffect(() => {
    window.localStorage.setItem(storageKeys.email, state.email);
    window.localStorage.setItem(storageKeys.answers, JSON.stringify(state.answers));
    window.localStorage.setItem(storageKeys.score, String(state.score));

    if (state.result) {
      window.localStorage.setItem(storageKeys.result, state.result);
    } else {
      window.localStorage.removeItem(storageKeys.result);
    }
  }, [state]);

  const actions = useMemo(
    () => ({
      start() {
        setState((current) => ({ ...current, screen: "email" }));
      },
      submitEmail(email: string) {
        setState((current) => ({ ...current, email, screen: "q1" }));
      },
      answer(questionId: string, optionId: string) {
        setState((current) => {
          const answers = { ...current.answers, [questionId]: optionId };
          const score = questions.reduce((sum, question) => {
            const answerId = answers[question.id];
            return sum + (question.options.find((option) => option.id === answerId)?.score ?? 0);
          }, 0);
          const questionIndex = questions.findIndex((question) => question.id === questionId);
          const nextQuestion = questions[questionIndex + 1];

          if (nextQuestion) {
            return { ...current, answers, score, screen: nextQuestion.id };
          }

          return { ...current, answers, score, result: computeResult(score), screen: "result" };
        });
      },
      reset() {
        setState(initialState);
      },
    }),
    [],
  );

  return { state, setState, actions };
}
