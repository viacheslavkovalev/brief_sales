import { questions } from "../data/quiz";
import type { AppState } from "../types";

const endpoint = import.meta.env.VITE_GOOGLE_SCRIPT_URL?.trim();
const retryDelays = [0, 1_000, 3_000];

type SubmissionPayload = {
  submissionId: string;
  revision: number;
  status: "started" | "in_progress" | "completed";
  company: string;
  phone: string;
  email: string;
  score: number;
  result: string;
  answers: Array<{
    questionId: string;
    question: string;
    optionId: string;
    answer: string;
    score: number;
  }>;
};

function buildPayload(state: AppState): SubmissionPayload {
  const revision = Object.keys(state.answers).length;

  return {
    submissionId: state.submissionId,
    revision,
    status: state.result ? "completed" : revision > 0 ? "in_progress" : "started",
    company: state.company,
    phone: state.phone,
    email: state.email,
    score: state.score,
    result: state.result ?? "",
    answers: questions.map((question) => {
      const optionId = state.answers[question.id] ?? "";
      const option = question.options.find((candidate) => candidate.id === optionId);

      return {
        questionId: question.id,
        question: question.title,
        optionId,
        answer: option?.text ?? "",
        score: option?.score ?? 0,
      };
    }),
  };
}

function wait(delay: number) {
  return new Promise((resolve) => window.setTimeout(resolve, delay));
}

export async function submitBrief(state: AppState) {
  if (!endpoint) {
    throw new Error("VITE_GOOGLE_SCRIPT_URL is not configured");
  }

  const submission = buildPayload(state);
  const payload = JSON.stringify(submission);
  let lastError: unknown;

  for (const delay of retryDelays) {
    if (delay) {
      await wait(delay);
    }

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        redirect: "manual",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: payload,
        keepalive: true,
      });

      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
