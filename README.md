# Brief Sales

Интерактивный аудит воронки продаж на React, TypeScript и Vite. Пользователь
оставляет контакты, отвечает на 13 вопросов и получает итоговую рекомендацию.
Прогресс сохраняется в `localStorage`, а контакты и ответы последовательно
записываются в Google Sheets.

## Локальный запуск

Требуется Node.js 20 или новее.

```bash
npm install
cp .env.example .env
npm run dev
```

В `.env` укажите URL опубликованного Google Apps Script:

```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Основные команды:

```bash
npm run dev      # локальный сервер разработки
npm run build    # TypeScript-проверка и production-сборка в dist/
npm run preview  # просмотр production-сборки
npm run deploy   # сборка и публикация в ветку gh-pages
```

## Структура проекта

- `src/data/quiz.ts` — вопросы, ответы и баллы.
- `src/data/results.ts` — итоговые заключения.
- `src/screens/` — экраны аудита.
- `src/utils/submission.ts` — отправка и подтверждение записи.
- `public/fonts/` и `public/images/` — используемые статические ресурсы.
- `google-apps-script/Code.gs` — backend для Google Sheets.

## Google Sheets

1. Откройте целевую таблицу и выберите `Расширения -> Apps Script`.
2. Перенесите содержимое `google-apps-script/Code.gs` в `Code.gs`.
3. Проверьте `SPREADSHEET_ID` и `SHEET_GID` в начале файла.
4. Выберите `Deploy -> New deployment -> Web app`.
5. Установите `Execute as: Me` и `Who has access: Anyone`.
6. Добавьте полученный URL `/exec` в `.env`.

Строка создаётся сразу после ввода компании, телефона и email, затем обновляется после каждого ответа.
`ScriptLock`, `submission_id` и номер ревизии защищают параллельные прохождения
от перезаписи. Скрипт сам создаёт заголовки и скрывает технические колонки.

После изменения скрипта опубликуйте новую версию существующего deployment.
Для полного удаления тестовых данных удаляйте строки целиком, начиная со второй:
очистка только видимых ячеек оставляет скрытые идентификаторы.

## GitHub Pages

В `vite.config.ts` значение `base` должно совпадать с именем репозитория:

```ts
base: "/brief_sales/"
```

Для production создайте локальный `.env.production` с
`VITE_GOOGLE_SCRIPT_URL`, затем выполните:

```bash
npm run deploy
```

Исходный код хранится в `main`, а ветка `gh-pages` содержит только
сгенерированную сборку. Не редактируйте `gh-pages` вручную. Файлы `.env`,
`node_modules/` и `dist/` не коммитятся.
