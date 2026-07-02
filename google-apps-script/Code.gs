const SPREADSHEET_ID = "1Q3v90Uis-3RahljvOx56Faa19IzlK4FatlMVfEiZszY";
const SHEET_GID = 0;
const QUESTION_COUNT = 13;
const SERVICE_VERSION = "progressive-v3";
const HEADERS = [
  "Компания",
  "Телефон",
  "email",
  ...Array.from({ length: QUESTION_COUNT }, (_, index) => `Вопрос ${index + 1}`),
  "Статус",
  "Прогресс",
  "Баллы",
  "Результат",
  "Создано",
  "Обновлено",
  "submission_id",
  "revision",
];
const COLUMN = {
  status: QUESTION_COUNT + 4,
  progress: QUESTION_COUNT + 5,
  score: QUESTION_COUNT + 6,
  result: QUESTION_COUNT + 7,
  createdAt: QUESTION_COUNT + 8,
  updatedAt: QUESTION_COUNT + 9,
  submissionId: QUESTION_COUNT + 10,
  revision: QUESTION_COUNT + 11,
};

function doGet(event) {
  const callback = String(event.parameter.callback || "");
  const submissionId = String(event.parameter.submissionId || "");

  if (callback) {
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]{0,150}$/.test(callback)) {
      return javascriptResponse("throw new Error('Invalid callback');");
    }

    const validId = /^[a-zA-Z0-9-]{10,100}$/.test(submissionId);
    const sheet = validId ? getTargetSheet() : null;
    const rowNumber = sheet ? findSubmissionRow(sheet, submissionId) : null;
    const revision = rowNumber ? Number(sheet.getRange(rowNumber, COLUMN.revision).getValue()) : -1;

    return javascriptResponse(
      `${callback}(${JSON.stringify({
        saved: Boolean(rowNumber),
        revision,
        version: SERVICE_VERSION,
      })});`,
    );
  }

  return jsonResponse({ ok: true, service: "brief-sales", version: SERVICE_VERSION });
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.parameter.payload || event.postData.contents);
    validatePayload(payload);

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    try {
      const sheet = getTargetSheet();
      ensureHeaders(sheet);

      const existingRowNumber = findSubmissionRow(sheet, payload.submissionId);
      const rowNumber = existingRowNumber || sheet.getLastRow() + 1;
      const existingRevision = existingRowNumber
        ? Number(sheet.getRange(rowNumber, COLUMN.revision).getValue())
        : -1;

      if (existingRevision > payload.revision) {
        return jsonResponse({ ok: true, stale: true, revision: existingRevision });
      }

      const now = new Date();
      const createdAt = existingRowNumber
        ? sheet.getRange(rowNumber, COLUMN.createdAt).getValue() || now
        : now;
      const row = [
        protectCell(payload.company),
        protectCell(payload.phone),
        protectCell(payload.email),
        ...payload.answers.map((answer) => protectCell(answer.answer)),
        payload.status,
        `${payload.revision}/${QUESTION_COUNT}`,
        payload.score,
        payload.result,
        createdAt,
        now,
        payload.submissionId,
        payload.revision,
      ];

      sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true, revision: payload.revision });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function getTargetSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets().find((candidate) => candidate.getSheetId() === SHEET_GID);

  if (!sheet) {
    throw new Error(`Sheet with gid=${SHEET_GID} was not found`);
  }

  return sheet;
}

function ensureHeaders(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  range.setValues([HEADERS]);
  sheet.hideColumns(COLUMN.submissionId, 2);
}

function findSubmissionRow(sheet, submissionId) {
  if (sheet.getLastRow() < 2) {
    return null;
  }

  const match = sheet
    .getRange(2, COLUMN.submissionId, sheet.getLastRow() - 1, 1)
    .createTextFinder(submissionId)
    .matchEntireCell(true)
    .findNext();

  return match ? match.getRow() : null;
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload");
  }

  if (!/^[a-zA-Z0-9-]{10,100}$/.test(String(payload.submissionId || ""))) {
    throw new Error("Invalid submissionId");
  }

  const email = String(payload.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error("Invalid email");
  }

  const company = String(payload.company || "").trim();
  if (company.length < 2 || company.length > 200) {
    throw new Error("Invalid company");
  }

  const phone = String(payload.phone || "").trim();
  if (phone.length < 5 || phone.length > 50) {
    throw new Error("Invalid phone");
  }

  if (!Number.isInteger(payload.revision) || payload.revision < 0 || payload.revision > QUESTION_COUNT) {
    throw new Error("Invalid revision");
  }

  if (!["started", "in_progress", "completed"].includes(payload.status)) {
    throw new Error("Invalid status");
  }

  if (!Number.isFinite(payload.score) || payload.score < 0 || payload.score > 26) {
    throw new Error("Invalid score");
  }

  if (payload.result && !["R1", "R2", "R3"].includes(payload.result)) {
    throw new Error("Invalid result");
  }

  if (!Array.isArray(payload.answers) || payload.answers.length !== QUESTION_COUNT) {
    throw new Error(`Expected ${QUESTION_COUNT} answers`);
  }

  payload.company = company;
  payload.phone = phone;
  payload.email = email;
  let answeredCount = 0;

  payload.answers.forEach((answer, index) => {
    if (!answer || answer.questionId !== `q${index + 1}`) {
      throw new Error(`Invalid answer ${index + 1}`);
    }

    if (typeof answer.answer !== "string" || answer.answer.length > 2000) {
      throw new Error(`Invalid answer text ${index + 1}`);
    }

    if (answer.answer) {
      answeredCount += 1;
    }
  });

  if (answeredCount !== payload.revision) {
    throw new Error("Revision does not match answered questions");
  }

  if (payload.status === "completed" && payload.revision !== QUESTION_COUNT) {
    throw new Error("Completed submission must contain every answer");
  }
}

function protectCell(value) {
  const text = String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function javascriptResponse(source) {
  return ContentService.createTextOutput(source).setMimeType(
    ContentService.MimeType.JAVASCRIPT,
  );
}
