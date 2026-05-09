// 5.7: golden-snapshot тесты для buildSystemPrompt.
// Снимаем минимальные снимки на нескольких представительных темах из topics.js.
// Цель — поймать неожиданные регрессии в структуре промпта (исчезли заголовки,
// поменялся порядок секций, перестали попадать examples и т. д.).

import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSystemPrompt } from "../assets/prompts.js";
import { topics } from "../assets/topics.js";

function snapshot(prompt) {
  // Не сравниваем побайтово — сжимаем до набора инвариантов.
  // Это «живой» snapshot: меняем тут осознанно, когда правда меняем формат.
  return {
    hasSystemHeader: /Ты — преподаватель программирования/.test(prompt),
    hasStartTemplate: /СТАРТОВЫЙ ШАБЛОН ПЕРВОГО ОТВЕТА/.test(prompt),
    hasFencedHint: /fenced code block/.test(prompt),
    hasContext: /КОНТЕКСТ ТЕКУЩЕЙ ТЕМЫ/.test(prompt),
    hasGoals: /Цели обучения по этой теме/.test(prompt),
    hasExamples: /Опорные SQL-примеры/.test(prompt),
    hasPitfalls: /Типичные подводные камни этой темы/.test(prompt),
  };
}

const expectedTopic = {
  hasSystemHeader: true,
  hasStartTemplate: true,
  hasFencedHint: true,
  hasContext: true,
  hasGoals: true,
  hasExamples: true,
  hasPitfalls: true,
};

const sampleTopics = [
  "psql-connect",
  "create-database",
  "inner-join",
  "composite-index",
  "acid",
  "sec-pg-hba",
  "win-frames",
];

for (const id of sampleTopics) {
  test(`golden snapshot для темы "${id}"`, () => {
    const t = topics[id];
    assert.ok(t, `topics["${id}"] не найдена`);
    const prompt = buildSystemPrompt(t);
    assert.deepStrictEqual(snapshot(prompt), expectedTopic);
    // Дополнительные проверки контекста: title и summary вшиваются дословно.
    assert.ok(prompt.includes(t.title), `в промпте нет title "${t.title}"`);
    if (t.summary) assert.ok(prompt.includes(t.summary), `в промпте нет summary темы ${id}`);
  });
}

const expectedExercise = {
  hasReviewMode:    true,
  hasTaskHeading:   true,
  hasReferenceSql:  true,
  hasFenced:        true,
};

test("golden snapshot для exercise-темы", () => {
  const t = topics["ex-joins-inner"];
  assert.ok(t && t.kind === "exercise", "expected exercise topic");
  const prompt = buildSystemPrompt(t);
  const snap = {
    hasReviewMode:   /Режим — КОД-РЕВЬЮ/.test(prompt),
    hasTaskHeading:  /Условие задачи:/.test(prompt),
    hasReferenceSql: /Эталонное решение/.test(prompt),
    hasFenced:       /```sql/.test(prompt),
  };
  assert.deepStrictEqual(snap, expectedExercise);
});
