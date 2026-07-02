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

function confirmSubmission(url: string, submissionId: string, revision: number) {
  return new Promise<boolean>((resolve, reject) => {
    const callbackName = `__briefStatus_${submissionId.replaceAll("-", "_")}_${Date.now()}`;
    const callbacks = window as unknown as Record<
      string,
      (payload: { saved?: boolean; revision?: number }) => void
    >;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Submission confirmation timed out"));
    }, 10_000);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete callbacks[callbackName];
    }

    callbacks[callbackName] = (response) => {
      cleanup();
      resolve(response.saved === true && (response.revision ?? -1) >= revision);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Submission confirmation failed"));
    };

    const statusUrl = new URL(url);
    statusUrl.searchParams.set("submissionId", submissionId);
    statusUrl.searchParams.set("callback", callbackName);
    statusUrl.searchParams.set("_", String(Date.now()));
    script.src = statusUrl.toString();
    document.head.append(script);
  });
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
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: payload,
        keepalive: true,
      });

      if (await confirmSubmission(endpoint, state.submissionId, submission.revision)) {
        return;
      }

      lastError = new Error("Submission was not saved");
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
