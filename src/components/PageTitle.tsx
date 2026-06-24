import { publicAsset } from "../utils/assets";

type PageTitleProps = {
  className?: string;
};

export function PageTitle({ className = "" }: PageTitleProps) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="font-travelsNext text-[26px] font-bold uppercase leading-[0.95] sm:text-[32px] md:text-[42px]">
        АУДИТ
        <br />
        ВОРОНКИ ПРОДАЖ
      </h1>
      <img
        className="mx-auto mt-4 w-full max-w-[520px]"
        src={publicAsset("images/hightlight.svg")}
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
