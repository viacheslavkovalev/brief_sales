import { useEffect, useRef } from "react";
import { maxScore, questions } from "./data/quiz";
import { results } from "./data/results";
import { usePersistentAppState } from "./hooks/usePersistentAppState";
import { EmailScreen } from "./screens/EmailScreen";
import { IntroScreen } from "./screens/IntroScreen";
import { QuestionScreen } from "./screens/QuestionScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { computeResult } from "./utils/results";
import { submitBrief } from "./utils/submission";

export function App() {
  const { state, actions } = usePersistentAppState();
  const syncingKey = useRef("");
  const confirmedRevision = useRef(-1);
  const failedRevision = useRef(-1);
  const latestRevision = useRef(-1);

  useEffect(() => {
    if (!state.email || !state.submissionId) {
      return;
    }

    const revision = Object.keys(state.answers).length;
    const requestKey = `${state.submissionId}:${revision}`;
    latestRevision.current = revision;

    if (
      syncingKey.current === requestKey ||
      confirmedRevision.current >= revision ||
      (failedRevision.current === revision && state.submissionStatus === "failed")
    ) {
      return;
    }

    syncingKey.current = requestKey;
    actions.setSubmissionStatus("pending");

    void submitBrief(state)
      .then(() => {
        confirmedRevision.current = Math.max(confirmedRevision.current, revision);
        failedRevision.current = -1;
        if (revision === latestRevision.current) {
          actions.setSubmissionStatus("sent");
        }
      })
      .catch(() => {
        failedRevision.current = Math.max(failedRevision.current, revision);
        if (revision === latestRevision.current) {
          actions.setSubmissionStatus("failed");
        }
      })
      .finally(() => {
        if (syncingKey.current === requestKey) {
          syncingKey.current = "";
        }
      });
  }, [
    actions,
    state.answers,
    state.email,
    state.result,
    state.score,
    state.submissionId,
    state.submissionStatus,
  ]);

  if (state.screen === "intro") {
    return <IntroScreen onStart={actions.start} />;
  }

  if (state.screen === "email") {
    return <EmailScreen initialEmail={state.email} onSubmit={actions.submitEmail} />;
  }

  if (state.screen === "result") {
    const resultId = state.result ?? computeResult(state.score);
    return (
      <ResultScreen
        result={results[resultId]}
        score={state.score}
        maxScore={maxScore}
      />
    );
  }

  const currentQuestion = questions.find((question) => question.id === state.screen) ?? questions[0];
  const questionIndex = questions.findIndex((question) => question.id === currentQuestion.id);

  return (
    <QuestionScreen
      question={currentQuestion}
      index={questionIndex}
      selectedOptionId={state.answers[currentQuestion.id]}
      onAnswer={actions.answer}
    />
  );
}
