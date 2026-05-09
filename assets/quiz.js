// Мини-квизы в конце страницы. Структура DOM:
//
// <section class="quiz" data-quiz-id="basics">
//   <h2>Мини-тест</h2>
//   <ol class="quiz-questions">
//     <li class="quiz-q" data-correct="b">
//       <p class="quiz-text">Вопрос?</p>
//       <label><input type="radio" name="q1" value="a"> Вариант A</label>
//       ...
//       <p class="quiz-explain" hidden>Пояснение к правильному ответу</p>
//     </li>
//     ...
//   </ol>
//   <div class="quiz-actions">
//     <button class="btn primary quiz-check">Проверить</button>
//     <button class="btn quiz-reset">Сбросить</button>
//   </div>
//   <p class="quiz-result" hidden></p>
// </section>
//
// Результат: { score: N, total: M } сохраняется под ключом
// psql-tutor:progress (через progress.js) в поле quiz: { id: { score, total, ts } }.

import { setProgress, getProgress } from "./progress.js?v=1";

const STORE_PREFIX = "psql-tutor:quiz:";

function loadResult(quizId) {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + quizId);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveResult(quizId, payload) {
  try { localStorage.setItem(STORE_PREFIX + quizId, JSON.stringify(payload)); } catch {}
}

export function initQuizzes(pagePath) {
  document.querySelectorAll(".quiz[data-quiz-id]").forEach(quizEl => {
    const id = quizEl.dataset.quizId;
    const checkBtn = quizEl.querySelector(".quiz-check");
    const resetBtn = quizEl.querySelector(".quiz-reset");
    const result   = quizEl.querySelector(".quiz-result");
    const questions = quizEl.querySelectorAll(".quiz-q");

    // Восстановить ранее сохранённый результат, если есть.
    const prev = loadResult(id);
    if (prev) {
      renderResult(prev.score, prev.total);
    }

    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        let score = 0;
        const total = questions.length;
        questions.forEach(q => {
          const correct = q.dataset.correct;
          const chosen = q.querySelector("input[type=radio]:checked");
          q.classList.remove("correct", "wrong");
          const explain = q.querySelector(".quiz-explain");
          if (chosen && chosen.value === correct) {
            score++;
            q.classList.add("correct");
          } else {
            q.classList.add("wrong");
          }
          if (explain) explain.hidden = false;
        });
        saveResult(id, { score, total, ts: Date.now() });
        renderResult(score, total);
        // Если набрали хотя бы 60% — отметить страницу как практиковавшуюся.
        if (pagePath && score / total >= 0.6) {
          setProgress(pagePath, { practiced: true });
          window.dispatchEvent(new CustomEvent("psql-tutor:progress-changed"));
        }
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        questions.forEach(q => {
          q.classList.remove("correct", "wrong");
          q.querySelectorAll("input[type=radio]").forEach(r => { r.checked = false; });
          const explain = q.querySelector(".quiz-explain");
          if (explain) explain.hidden = true;
        });
        if (result) result.hidden = true;
        try { localStorage.removeItem(STORE_PREFIX + id); } catch {}
      });
    }

    function renderResult(score, total) {
      if (!result) return;
      const pct = Math.round(100 * score / total);
      const verdict = pct >= 80 ? "Отлично" : pct >= 60 ? "Неплохо" : "Стоит вернуться к материалу";
      result.hidden = false;
      result.textContent = `Результат: ${score} из ${total} (${pct}%). ${verdict}.`;
      result.classList.toggle("good", pct >= 60);
    }
  });
}
