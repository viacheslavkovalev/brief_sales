export type Screen = "intro" | "email" | "q1" | "q2" | "q3" | "q4" | "q5" | "result";

export type ResultId = "R1" | "R2" | "R3";

export type Option = {
  id: string;
  text: string;
  score: number;
};

export type Question = {
  id: "q1" | "q2" | "q3" | "q4" | "q5";
  title: string;
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
};
