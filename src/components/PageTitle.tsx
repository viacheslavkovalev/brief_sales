type PageTitleProps = {
  className?: string;
};

export function PageTitle({ className = "" }: PageTitleProps) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="font-travelsNext text-[30px] font-bold uppercase leading-[0.95] sm:text-[38px] md:text-[52px]">
        ЭКСПРЕСС-АУДИТ
        <br />
        ВОРОНКИ ПРОДАЖ
      </h1>
      <img
        className="mx-auto mt-4 w-full max-w-[520px]"
        src="/images/hightlight.svg"
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
