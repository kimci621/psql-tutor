import assert from "node:assert/strict";
import { test } from "node:test";

import { buildInitialUserMessage, buildSystemPrompt } from "../assets/prompts.js";

const topic = {
  title: "Подключение через psql",
  summary: "Как подключиться к серверу PostgreSQL утилитой psql.",
  examples: [
    "psql -h localhost -p 5432 -U postgres -d mydb",
    "\\c another_db",
  ],
  pitfalls: ["Команды на бэкслеше — это мета-команды psql, не SQL"],
  learningGoals: ["понимать роли параметров -h -p -U -d"],
};

test("system prompt asks model to teach topic before questions", () => {
  const prompt = buildSystemPrompt(topic);

  assert.match(prompt, /Сначала объясни тему/);
  assert.match(prompt, /Коротко:/);
  assert.match(prompt, /Зачем нужно:/);
  assert.match(prompt, /Проверка понимания:/);
  assert.match(prompt, /fenced code block/);
  assert.match(prompt, /```bash/);
  assert.match(prompt, /используй их дословно/);
  assert.match(prompt, /Не заменяй строки/);
  assert.doesNotMatch(prompt, /Открывай разговор коротким вопросом/);
});

test("initial hidden user message includes selected topic title", () => {
  assert.equal(
    buildInitialUserMessage(topic),
    'Объясни тему "Подключение через psql" по учебному шаблону. Начни с объяснения, покажи пример отдельным fenced code block, затем задай один проверочный вопрос.',
  );
});
