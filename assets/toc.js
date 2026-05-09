// Оглавление страницы (TOC) справа на десктопе.
// Собирает h2 секций из main и подсвечивает активную через IntersectionObserver.

export function initTOC() {
  const main = document.querySelector("main.main");
  if (!main) return;

  const headings = Array.from(main.querySelectorAll("section.category > h2"));
  if (headings.length < 2) return;  // на коротких страницах не нужно

  // Гарантируем id у каждого h2 (для якоря из TOC).
  headings.forEach((h, i) => {
    if (!h.id) h.id = "toc-section-" + i;
  });

  const aside = document.createElement("aside");
  aside.className = "page-toc";
  aside.setAttribute("aria-label", "Оглавление страницы");
  aside.innerHTML = `
    <div class="toc-title">На этой странице</div>
    <ul class="toc-list">
      ${headings.map(h => `
        <li><a href="#${h.id}" data-toc-target="${h.id}">${escapeHtml(h.textContent.trim())}</a></li>
      `).join("")}
    </ul>
  `;
  document.body.appendChild(aside);

  const links = new Map(
    Array.from(aside.querySelectorAll("a[data-toc-target]"))
      .map(a => [a.dataset.tocTarget, a])
  );

  // IntersectionObserver: активной считаем последнюю h2, чей верх ушёл выше центра экрана.
  let active = null;
  const visible = new Set();
  const obs = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) visible.add(e.target.id);
      else                  visible.delete(e.target.id);
    }
    // выбираем верхнюю из видимых
    let topId = null;
    let topY = Infinity;
    for (const id of visible) {
      const el = document.getElementById(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top < topY) { topY = r.top; topId = id; }
    }
    if (topId !== active) {
      if (active && links.has(active)) links.get(active).classList.remove("active");
      if (topId && links.has(topId))    links.get(topId).classList.add("active");
      active = topId;
    }
  }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });

  headings.forEach(h => obs.observe(h));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
