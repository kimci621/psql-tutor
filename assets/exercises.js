// Упражнения. Структура DOM на странице:
//
// <article class="exercise" id="ex-...">
//   <h3>...</h3>
//   <div class="ex-task">условие</div>
//   <textarea class="ex-attempt" placeholder="Напиши свой SQL..."></textarea>
//   <div class="ex-actions">
//     <button class="btn ex-toggle">Показать решение</button>
//     <button class="btn primary" data-topic-id="ex-..." data-exercise>💬 Разобрать с ИИ</button>
//   </div>
//   <div class="ex-solution" hidden>
//     <pre>...эталон...</pre>
//   </div>
// </article>
//
// Кнопка "Показать решение" показывает/прячет .ex-solution.
// Текст из textarea читается chat.js при клике на data-exercise — см. chat.js.

const ATTEMPT_PREFIX = "psql-tutor:ex-attempt:";

export function initExercises() {
  document.querySelectorAll(".exercise").forEach(card => {
    const id = card.id;
    const ta = card.querySelector(".ex-attempt");
    const toggle = card.querySelector(".ex-toggle");
    const solution = card.querySelector(".ex-solution");

    // Сохраняем попытку ученика в localStorage по id упражнения,
    // чтобы случайно не потерять при перезагрузке.
    if (ta && id) {
      try {
        const saved = localStorage.getItem(ATTEMPT_PREFIX + id);
        if (saved) ta.value = saved;
      } catch {}
      ta.addEventListener("input", () => {
        try { localStorage.setItem(ATTEMPT_PREFIX + id, ta.value); } catch {}
      });
    }

    if (toggle && solution) {
      toggle.addEventListener("click", () => {
        const shown = !solution.hasAttribute("hidden");
        if (shown) {
          solution.setAttribute("hidden", "");
          toggle.textContent = "Показать решение";
        } else {
          solution.removeAttribute("hidden");
          toggle.textContent = "Скрыть решение";
        }
      });
    }
  });
}

// Возвращает попытку ученика по id упражнения (либо пустую строку).
export function getExerciseAttempt(exerciseId) {
  const card = document.getElementById(exerciseId);
  if (!card) return "";
  const ta = card.querySelector(".ex-attempt");
  return ta ? ta.value.trim() : "";
}
