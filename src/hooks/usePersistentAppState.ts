import { useEffect, useMemo, useState } from "react";
import { questions } from "../data/quiz";
import type { AppState, ResultId, Screen, SubmissionStatus } from "../types";
import { computeResult } from "../utils/results";

const storageKeys = {
  version: "bs_version",
  company: "bs_company",
  phone: "bs_phone",
  email: "bs_email",
  answers: "bs_answers",
  score: "bs_score",
  result: "bs_result",
  submissionId: "bs_submission_id",
  submissionStatus: "bs_submission_status",
} as const;

const storageVersion = "3";

const initialState: AppState = {
  screen: "intro",
  company: "",
  phone: "",
  email: "",
  answers: {},
  score: 0,
  result: null,
  submissionId: "",
  submissionStatus: "idle",
};

function getStoredResult(value: string | null): ResultId | null {
  return value === "R1" || value === "R2" || value === "R3" ? value : null;
}

function getStoredSubmissionStatus(value: string | null): SubmissionStatus {
  return value === "pending" || value === "sent" || value === "failed" ? value : "idle";
}

function createSubmissionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    if (window.localStorage.getItem(storageKeys.version) !== storageVersion) {
      Object.values(storageKeys).forEach((key) => window.localStorage.removeItem(key));
      window.localStorage.setItem(storageKeys.version, storageVersion);
      return initialState;
    }

    const email = window.localStorage.getItem(storageKeys.email) ?? "";
    const company = window.localStorage.getItem(storageKeys.company) ?? "";
    const phone = window.localStorage.getItem(storageKeys.phone) ?? "";
    const answers = JSON.parse(window.localStorage.getItem(storageKeys.answers) ?? "{}") as Record<string, string>;
    const storedScore = Number(window.localStorage.getItem(storageKeys.score) ?? "0");
    const result = getStoredResult(window.localStorage.getItem(storageKeys.result));
    const submissionId = window.localStorage.getItem(storageKeys.submissionId) ?? "";
    const storedSubmissionStatus = getStoredSubmissionStatus(
      window.localStorage.getItem(storageKeys.submissionStatus),
    );
    const score = Number.isFinite(storedScore) ? storedScore : 0;
    const submissionStatus = result && storedSubmissionStatus === "idle" ? "pending" : storedSubmissionStatus;

    return {
      screen: getNextScreen(email, answers, result),
      company,
      phone,
      email,
      answers,
      score,
      result,
      submissionId: result && !submissionId ? createSubmissionId() : submissionId,
      submissionStatus,
    };
  } catch {
    return initialState;
  }
}

export function usePersistentAppState() {
  const [state, setState] = useState<AppState>(() => readStoredState());

  useEffect(() => {
    window.localStorage.setItem(storageKeys.version, storageVersion);
    window.localStorage.setItem(storageKeys.company, state.company);
    window.localStorage.setItem(storageKeys.phone, state.phone);
    window.localStorage.setItem(storageKeys.email, state.email);
    window.localStorage.setItem(storageKeys.answers, JSON.stringify(state.answers));
    window.localStorage.setItem(storageKeys.score, String(state.score));
    window.localStorage.setItem(storageKeys.submissionId, state.submissionId);
    window.localStorage.setItem(storageKeys.submissionStatus, state.submissionStatus);

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
      submitEmail(contact: { company: string; phone: string; email: string }) {
        setState((current) => ({
          ...current,
          company: contact.company,
          phone: contact.phone,
          email: contact.email,
          screen: "q1",
          submissionId: createSubmissionId(),
          submissionStatus: "pending",
        }));
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

          return {
            ...current,
            answers,
            score,
            result: computeResult(score),
            screen: "result",
            submissionId: current.submissionId || createSubmissionId(),
            submissionStatus: "pending",
          };
        });
      },
      setSubmissionStatus(submissionStatus: SubmissionStatus) {
        setState((current) => ({ ...current, submissionStatus }));
      },
      retrySubmission() {
        setState((current) => ({ ...current, submissionStatus: "pending" }));
      },
      reset() {
        setState(initialState);
      },
    }),
    [],
  );

  return { state, setState, actions };
}
