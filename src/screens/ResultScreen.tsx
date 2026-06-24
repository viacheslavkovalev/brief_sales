import { Button } from "../components/Button";
import { ImportantBlock } from "../components/ImportantBlock";
import { ScreenShell } from "../components/ScreenShell";
import type { Result, SubmissionStatus } from "../types";
import { publicAsset } from "../utils/assets";

type ResultScreenProps = {
  result: Result;
  score: number;
  maxScore: number;
  submissionStatus: SubmissionStatus;
  onRetrySubmission: () => void;
};

export function ResultScreen({
  result,
  score,
  maxScore,
  submissionStatus,
  onRetrySubmission,
}: ResultScreenProps) {
  return (
    <ScreenShell>
      <section className="flex flex-1 flex-col">
        <div className="mt-12 border-y border-white py-5 md:mt-[92px]">
          <p className="font-travels text-[20px] leading-[1.2] text-white/75">
            Ваш результат: {score} из {maxScore}
          </p>
          <div className="mt-2 min-h-5 font-travels text-sm text-white/75" aria-live="polite">
            {submissionStatus === "pending" ? <p>Сохраняем ответы...</p> : null}
            {submissionStatus === "sent" ? <p>Ответы сохранены.</p> : null}
            {submissionStatus === "failed" ? (
              <p>
                Не удалось сохранить ответы.{" "}
                <button className="underline underline-offset-4" type="button" onClick={onRetrySubmission}>
                  Повторить
                </button>
              </p>
            ) : null}
          </div>
          <h1 className="mt-4 font-travelsNext text-[32px] font-bold uppercase leading-none md:text-[44px]">
            {result.title}
          </h1>
        </div>

        <div className="mt-8 grid gap-4 font-travels text-[18px] leading-[1.35] text-white">
          {result.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="font-bold">
            Чем ниже балл, тем выше вероятность, что проблема находится не в количестве лидов, а в системе работы
            с ними.
          </p>
        </div>

        <div className="mt-8 grid gap-6 rounded-[14px] bg-white px-5 py-6 md:grid-cols-[1fr_112px] md:px-8 md:py-8">
          <ImportantBlock text={result.important} />
          <img
            className="mx-auto size-[96px] rounded-full object-cover md:size-[112px]"
            src={publicAsset("images/eugeniya_photo.png")}
            alt=""
            loading="lazy"
          />
          <a className="md:col-span-2" href={result.ctaUrl} target="_blank" rel="noreferrer">
            <Button
              className="w-full"
              variant="darkCta"
              type="button"
            >
              {result.ctaText}
            </Button>
          </a>
        </div>
      </section>
    </ScreenShell>
  );
}
