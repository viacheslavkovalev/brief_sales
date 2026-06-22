type ImportantBlockProps = {
  text: string;
};

export function ImportantBlock({ text }: ImportantBlockProps) {
  return (
    <aside className="flex gap-4 text-figmaBg" aria-label="Важная рекомендация">
      <span className="mt-1 size-3 shrink-0 rounded-full bg-figmaBg" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-travelsNext text-[20px] font-bold uppercase leading-none text-figmaBg md:text-[24px]">
          ВАЖНО
        </p>
        <p className="mt-3 font-travels text-base leading-[1.35] text-figmaBg">{text}</p>
      </div>
    </aside>
  );
}
