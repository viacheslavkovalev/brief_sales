export type QuestionId = `q${number}`;

export type Screen = "intro" | "email" | QuestionId | "result";

export type ResultId = "R1" | "R2" | "R3";

export type SubmissionStatus = "idle" | "pending" | "sent" | "failed";

export type Option = {
  id: string;
  text: string;
  score: number;
};

export type Question = {
  id: QuestionId;
  title: string;
  items?: string[];
  options: Option[];
};

export type Result = {
  id: ResultId;
  title: string;
  body: string[];
  important: string;
  image?: string;
  ctaText: string;
  ctaUrl: string;
};

export type AppState = {
  screen: Screen;
  email: string;
  answers: Record<string, string>;
  score: number;
  result: ResultId | null;
  submissionId: string;
  submissionStatus: SubmissionStatus;
};
