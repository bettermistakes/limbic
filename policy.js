/* ---------------------------- legal table of contents ---------------------------- */

function initLegalTableOfContents() {
  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function ensureUniqueId(base) {
    let id = base || "legal-section";
    let n = 0;
    while (document.getElementById(id)) {
      id = `${base}-${++n}`;
    }
    return id;
  }

  function scrollElementToViewportCenter(el) {
    const rect = el.getBoundingClientRect();
    const elCenterY = rect.top + window.scrollY + rect.height / 2;
    const top = elCenterY - window.innerHeight / 2;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  }

  const wrap = document.querySelector(".legal-content-wrap");
  const tocLinks = document.querySelector(".legal-toc-links");
  if (!wrap || !tocLinks) return;

  const topics = wrap.querySelectorAll(".legal-topic");
  tocLinks.textContent = "";

  topics.forEach((topicEl, index) => {
    const section = topicEl.closest(".legal-content-section");
    if (!section) return;

    const text = (topicEl.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;

    if (!section.id) {
      const base = slugify(text) || `legal-section-${index}`;
      section.id = ensureUniqueId(base);
    }

    const a = document.createElement("a");
    a.href = `#${section.id}`;
    a.className = "legal-toc-link w-inline-block";
    const p = document.createElement("p");
    p.textContent = text;
    a.appendChild(p);

    a.addEventListener("click", (e) => {
      e.preventDefault();
      const toc = document.querySelector(".legal-toc");
      if (toc) toc.classList.remove("is-open");
      // Measure after TOC closes so layout (mobile) doesn’t throw off the math.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollElementToViewportCenter(section);
        });
      });
    });

    tocLinks.appendChild(a);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLegalTableOfContents);
} else {
  initLegalTableOfContents();
}
