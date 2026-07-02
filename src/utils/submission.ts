import { questions } from "../data/quiz";
import type { AppState } from "../types";

const endpoint = import.meta.env.VITE_GOOGLE_SCRIPT_URL?.trim();
const retryDelays = [0, 1_000, 3_000];
const formSubmitWaitMs = 1_500;

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

async function postViaHiddenForm(payload: string) {
  const frameName = `brief_submit_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const iframe = document.createElement("iframe");
  const form = document.createElement("form");
  const input = document.createElement("input");

  iframe.name = frameName;
  iframe.hidden = true;

  form.action = endpoint ?? "";
  form.method = "POST";
  form.target = frameName;
  form.hidden = true;

  input.type = "hidden";
  input.name = "payload";
  input.value = payload;

  form.append(input);
  document.body.append(iframe, form);
  form.submit();

  await wait(formSubmitWaitMs);
  form.remove();
  iframe.remove();
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
      await postViaHiddenForm(payload);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
