type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-figmaBg/15" aria-hidden="true">
      <div className="h-full rounded-full bg-figmaBg transition-[width] duration-[400ms]" style={{ width: `${value}%` }} />
    </div>
  );
}
