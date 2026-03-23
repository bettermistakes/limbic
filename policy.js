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

  function scrollElementTopToViewportCenter(el) {
    const rect = el.getBoundingClientRect();
    const elTopY = rect.top + window.scrollY;
    const top = elTopY - window.innerHeight / 2;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  }

  const wrap = document.querySelector(".legal-content-wrap");
  const tocLinks = document.querySelector(".legal-toc-links");
  if (!wrap || !tocLinks) return;

  const docTableRoot = tocLinks.closest(".legal-doc-table-content");
  const docTrigger = docTableRoot?.querySelector(".legal-doc-trigger");

  const isMobileDocToc = () => window.innerWidth <= 991;

  function closeDocDropdown() {
    if (docTableRoot) docTableRoot.classList.remove("is-open");
  }

  if (docTrigger && docTableRoot) {
    docTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!isMobileDocToc()) return;
      docTableRoot.classList.toggle("is-open");
    });

    document.addEventListener("click", (e) => {
      if (!isMobileDocToc()) return;
      if (!docTableRoot.contains(e.target)) closeDocDropdown();
    });
  }

  const topics = wrap.querySelectorAll(".legal-topic");
  tocLinks.textContent = "";

  const tocItems = [];

  topics.forEach((topicEl, index) => {
    const section = topicEl.closest(".legal-content-section");
    if (!section) return;

    const text = (topicEl.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;

    if (!section.id) {
      const base = slugify(text) || `legal-section-${index}`;
      section.id = ensureUniqueId(base);
    }

    // <button>: no href hash, so the browser cannot native-scroll the target to the top.
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "legal-toc-link w-inline-block";
    const p = document.createElement("p");
    p.textContent = text;
    btn.appendChild(p);

    btn.addEventListener("click", () => {
      setActiveButton(btn);
      closeDocDropdown();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollElementTopToViewportCenter(topicEl);
        });
      });
    });

    tocLinks.appendChild(btn);
    tocItems.push({ section, btn, topicEl });
  });

  function setActiveButton(activeBtn) {
    tocItems.forEach((item) => {
      item.btn.classList.toggle("is-active", item.btn === activeBtn);
    });
  }

  // Scroll spy: active section = last one whose top has crossed the marker (stays stable while you read the section body).
  const scrollMarkerRatio = 0.5;

  function updateActiveFromScroll() {
    if (!tocItems.length) return;
    const markerY = window.innerHeight * scrollMarkerRatio;
    let activeIdx = 0;
    for (let i = 0; i < tocItems.length; i++) {
      const top = tocItems[i].section.getBoundingClientRect().top;
      if (top <= markerY) activeIdx = i;
    }
    setActiveButton(tocItems[activeIdx].btn);
  }

  let scrollSpyTicking = false;
  function onScrollOrResize() {
    if (scrollSpyTicking) return;
    scrollSpyTicking = true;
    requestAnimationFrame(() => {
      scrollSpyTicking = false;
      if (!isMobileDocToc()) closeDocDropdown();
      updateActiveFromScroll();
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  updateActiveFromScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLegalTableOfContents);
} else {
  initLegalTableOfContents();
}
