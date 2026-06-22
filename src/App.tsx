import { questions } from "./data/quiz";
import { results } from "./data/results";
import { usePersistentAppState } from "./hooks/usePersistentAppState";
import { EmailScreen } from "./screens/EmailScreen";
import { IntroScreen } from "./screens/IntroScreen";
import { QuestionScreen } from "./screens/QuestionScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { computeResult } from "./utils/results";

export function App() {
  const { state, actions } = usePersistentAppState();

  if (state.screen === "intro") {
    return <IntroScreen onStart={actions.start} />;
  }

  if (state.screen === "email") {
    return <EmailScreen initialEmail={state.email} onSubmit={actions.submitEmail} />;
  }

  if (state.screen === "result") {
    const resultId = state.result ?? computeResult(state.score);
    return <ResultScreen result={results[resultId]} />;
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
