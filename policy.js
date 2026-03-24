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

  function stripLeadingSectionNumber(s) {
    const stripped = s.replace(/^\d+(?:\.\d+)*\.?\s+/, "").trim();
    return stripped || s;
  }

  const TOC_SCROLL_TOP_OFFSET_PX = 200;

  function scrollTocTargetIntoView(el) {
    const rect = el.getBoundingClientRect();
    const elTopY = rect.top + window.scrollY;
    const top = elTopY - TOC_SCROLL_TOP_OFFSET_PX;
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

  let tocNavPendingBtn = null;
  let tocNavFallbackTimer = null;

  function finishTocProgrammaticNavigation() {
    if (!tocNavPendingBtn) return;
    tocNavPendingBtn = null;
    if (tocNavFallbackTimer != null) {
      clearTimeout(tocNavFallbackTimer);
      tocNavFallbackTimer = null;
    }
    updateActiveFromScroll();
  }

  window.addEventListener("scrollend", finishTocProgrammaticNavigation);

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
    p.textContent = stripLeadingSectionNumber(text);
    btn.appendChild(p);

    btn.addEventListener("click", () => {
      tocNavPendingBtn = btn;
      if (tocNavFallbackTimer != null) clearTimeout(tocNavFallbackTimer);
      setActiveButton(btn);
      closeDocDropdown();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollTocTargetIntoView(topicEl);
        });
      });
      tocNavFallbackTimer = window.setTimeout(finishTocProgrammaticNavigation, 900);
    });

    tocLinks.appendChild(btn);
    tocItems.push({ section, btn, topicEl });
  });

  function setActiveButton(activeBtn) {
    tocItems.forEach((item) => {
      item.btn.classList.toggle("is-active", item.btn === activeBtn);
    });
  }

  // Scroll spy: use each .legal-topic top (same node we scroll to on click), not .legal-content-section —
  // section boxes often sit higher (margins/wrappers), so the old logic could keep the previous item active after jumping to e.g. section 6.
  const scrollMarkerRatio = 0.5;

  function updateActiveFromScroll() {
    if (!tocItems.length) return;
    if (tocNavPendingBtn) return;
    const markerY = window.innerHeight * scrollMarkerRatio;
    let activeIdx = 0;
    for (let i = 0; i < tocItems.length; i++) {
      const top = tocItems[i].topicEl.getBoundingClientRect().top;
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

/* ---------------------------- legal list items: .li--grid (strong + body text) ---------------------------- */

function wrapLiGridBody(grid) {
  if (grid.querySelector(":scope > .li--grid-body")) return;
  const strongEl = grid.querySelector(":scope > strong");
  if (!strongEl) return;

  const body = document.createElement("div");
  body.className = "li--grid-body";

  let n = strongEl.nextSibling;
  while (n) {
    const next = n.nextSibling;
    body.appendChild(n);
    n = next;
  }

  if (!body.firstChild) return;
  strongEl.insertAdjacentElement("afterend", body);
}

function initLiGridWrap() {
  const root = document.querySelector(".legal-content-wrap");
  if (!root) return;

  root.querySelectorAll("li").forEach((li) => {
    if (li.querySelector(":scope > .li--grid")) return;
    const firstEl = li.firstElementChild;
    if (!firstEl || firstEl.tagName !== "STRONG") return;

    const wrapper = document.createElement("div");
    wrapper.className = "li--grid";

    while (li.firstChild) {
      const node = li.firstChild;
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node.tagName === "UL" || node.tagName === "OL")
      ) {
        break;
      }
      wrapper.appendChild(node);
    }

    if (!wrapper.firstChild) return;
    li.insertBefore(wrapper, li.firstChild);
    wrapLiGridBody(wrapper);
  });

  root.querySelectorAll(".li--grid").forEach(wrapLiGridBody);
}

function bootPolicyPage() {
  initLegalTableOfContents();
  initLiGridWrap();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootPolicyPage);
} else {
  bootPolicyPage();
}
