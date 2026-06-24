import { Button } from "../components/Button";
import { PageTitle } from "../components/PageTitle";
import { ScreenShell } from "../components/ScreenShell";

type IntroScreenProps = {
  onStart: () => void;
};

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <ScreenShell className="items-center text-center">
      <section className="flex flex-1 flex-col items-center">
        <PageTitle className="mt-6 md:mt-8" />

        <div className="mt-8 w-full max-w-[640px] space-y-4 text-left font-travels text-[18px] leading-[1.2] text-white">
          <p>
            Пока идёт встреча, предлагаем разобрать, как на самом деле устроены ваши продажи.
          </p>
          <p>
            13 вопросов: хватает ли лидов, где течёт воронка, что происходит с базой тех, кто не купил, как
            работает агентский канал и контроль отдела. Отвечаете честно — мы считаем балл и показываем, где
            главный резерв роста.
          </p>
          <p className="!mt-8 font-bold md:!mt-10">Что вы получите на выходе:</p>
          <ul className="space-y-3">
            <li>→ Балл по вашей системе продаж и место на шкале — от отдела, который работает на интуиции, до зрелой системы.</li>
            <li>→ Точку, где сейчас главный резерв роста: в количестве лидов, в воронке, в базе или у агентов. Чаще всего она не там, где кажется.</li>
            <li>→ Направление, с чего начать — что даст результат быстрее всего и обычно без увеличения рекламного бюджета.</li>
          </ul>
          <p>
            А пока вы отвечаете, мы видим общую картину по рынку и разберём самые частые проблемы прямо на встрече.
          </p>
        </div>

        <Button className="mt-8 w-full max-w-[640px] md:mt-10" type="button" onClick={onStart}>
          Начать
        </Button>
      </section>
    </ScreenShell>
  );
}
