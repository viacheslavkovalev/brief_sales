import type { Option } from "../types";

type RadioOptionProps = {
  option: Option;
  questionId: string;
  checked: boolean;
  onChange: (optionId: string) => void;
};

export function RadioOption({ option, questionId, checked, onChange }: RadioOptionProps) {
  const textParts = option.text.split("→");

  return (
    <label
      className={`flex min-h-[58px] cursor-pointer items-center gap-4 rounded-lg border px-5 py-4 text-left font-travels text-[18px] leading-[1.2] text-figmaBg transition focus-within:ring-2 focus-within:ring-figmaBg/40 ${
        checked ? "border-figmaBg bg-figmaBg/[0.06]" : "border-figmaBg/25 bg-transparent hover:border-figmaBg/60"
      }`}
    >
      <input
        className="peer sr-only"
        type="radio"
        name={questionId}
        value={option.id}
        checked={checked}
        onChange={() => onChange(option.id)}
      />
      <span
        className={`grid size-[18px] shrink-0 place-items-center rounded border ${
          checked ? "border-figmaBg bg-figmaBg" : "border-figmaBg/60"
        }`}
        aria-hidden="true"
      >
        <span className={`size-2 rounded-sm bg-white ${checked ? "opacity-100" : "opacity-0"}`} />
      </span>
      <span>
        {textParts.map((part, index) => (
          <span key={`${option.id}-${index}`}>
            {part}
            {index < textParts.length - 1 ? <span className="font-sans">→</span> : null}
          </span>
        ))}
      </span>
    </label>
  );
}
