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

const exerciseTopic = {
  kind: "exercise",
  title: "Упражнение: первые SELECT и WHERE",
  task: "Выбери активных пользователей",
  solution: "SELECT * FROM users WHERE is_active",
  solutionNote: "не забывай про NULL",
  pitfalls: ["сравнение с NULL"],
  learningGoals: ["WHERE с NULL"],
};

test("exercise system prompt switches to code-review mode and embeds task + solution", () => {
  const prompt = buildSystemPrompt(exerciseTopic);
  assert.match(prompt, /Режим — КОД-РЕВЬЮ/);
  assert.match(prompt, /Условие задачи:/);
  assert.match(prompt, /Выбери активных пользователей/);
  assert.match(prompt, /Эталонное решение/);
  assert.match(prompt, /SELECT \* FROM users WHERE is_active/);
  assert.match(prompt, /ученик ещё не написал свой запрос/);
});

test("exercise system prompt embeds the student's attempt when provided", () => {
  const prompt = buildSystemPrompt(exerciseTopic, { exerciseAttempt: "select id from users" });
  assert.match(prompt, /ПОПЫТКА УЧЕНИКА \(как есть/);
  assert.match(prompt, /select id from users/);
  assert.doesNotMatch(prompt, /ученик ещё не написал свой запрос/);
});

test("exercise initial user message differs based on attempt", () => {
  const noAttempt = buildInitialUserMessage(exerciseTopic);
  assert.match(noAttempt, /Я ещё не писал запрос/);
  const withAttempt = buildInitialUserMessage(exerciseTopic, { exerciseAttempt: "select 1" });
  assert.match(withAttempt, /Я уже написал попытку/);
});
