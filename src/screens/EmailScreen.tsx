import { FormEvent, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { PageTitle } from "../components/PageTitle";
import { ScreenShell } from "../components/ScreenShell";

type EmailScreenProps = {
  initialEmail: string;
  onSubmit: (email: string) => void;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EmailScreen({ initialEmail, onSubmit }: EmailScreenProps) {
  const [email, setEmail] = useState(initialEmail);
  const [touched, setTouched] = useState(false);
  const valid = useMemo(() => isValidEmail(email), [email]);
  const showError = touched && email.length > 0 && !valid;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (valid) {
      onSubmit(email.trim());
    }
  }

  return (
    <ScreenShell className="items-center text-center">
      <form className="flex w-full flex-1 flex-col items-center" onSubmit={handleSubmit} noValidate>
        <PageTitle className="mt-6 md:mt-8" />

        <div className="mt-10 flex min-h-[520px] w-full max-w-[640px] items-center md:mt-12 md:min-h-[420px]">
          <div className="w-full text-left">
            <label className="font-travels text-[20px] leading-[1.2] text-white" htmlFor="email">
              Укажите вашу почту
            </label>
            <input
              className="mt-4 h-[52px] w-full rounded-lg border border-white bg-white px-5 font-travels text-base text-figmaBg outline-none transition placeholder:text-[#4A5C78] focus:border-white focus:ring-2 focus:ring-white/40"
              id="email"
              type="email"
              inputMode="email"
              placeholder="example@mail.ru"
              required
              value={email}
              onBlur={() => setTouched(true)}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={showError}
              aria-describedby={showError ? "email-error" : undefined}
            />
            <p className="mt-3 min-h-[20px] font-travels text-sm text-accent" id="email-error" aria-live="polite">
              {showError ? "Введите корректный email" : ""}
            </p>
          </div>
        </div>

        <Button className="mt-5 w-full max-w-[640px] md:mt-6" type="submit" disabled={!valid}>
          Далее
        </Button>
      </form>
    </ScreenShell>
  );
}
