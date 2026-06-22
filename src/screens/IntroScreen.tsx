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
        <PageTitle className="mt-12 md:mt-[56px]" />

        <img
          className="mt-8 w-full max-w-[640px] rounded-[35px] object-contain shadow-soft md:mt-10"
          src="/images/first_frame.png"
          alt=""
          loading="eager"
        />

        <div className="mt-8 w-full max-w-[640px] space-y-4 text-left font-travels text-[18px] leading-[1.2] text-white md:mt-10">
          <p>Пока идёт встреча, предлагаем пройти мини-аудит.</p>
          <p>
            Он займёт 2–3 минуты и поможет понять, где сейчас находится главный резерв для роста продаж:
            в количестве лидов, в работе с воронкой, клиентской базой или агентским каналом.
          </p>
          <p>
            В конце покажем ваш результат и дадим направление, на что стоит обратить внимание в первую очередь.
          </p>
          <p>
            А ещё мы увидим общую картину по рынку и разберём самые частые проблемы прямо во время встречи.
          </p>
        </div>

        <Button className="mt-8 w-full max-w-[640px] md:mt-10" type="button" onClick={onStart}>
          Начать
        </Button>
      </section>
    </ScreenShell>
  );
}
