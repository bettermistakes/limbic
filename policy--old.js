/* ---------------------------- legal policy TOC (scoped IIFE) ---------------------------- */
// Why: Wraps everything in an anonymous function so no globals leak (safe next to Webflow
// and other scripts). Your page structure is .legal-content > .legal-toc + .legal-content-wrap
// with sections as .legal-content-section containing h5 / .legal-topic / bold titles.
(function () {
  /* ---------------------------- init TOC ---------------------------- */
  // Why: Single setup routine that connects the sidebar (.legal-toc) to the long-form
  // body (.legal-content-section). It needs .legal-toc-links (emptied and rebuilt), the
  // mobile header row (.legal-toc .margin-bottom-16 + .toc-heading), and at least one
  // heading inside a section — otherwise there is nothing to anchor and we exit safely.
  function initTOC() {
    const tocWrapper = document.querySelector('.legal-toc');
    const tocLinks = document.querySelector('.legal-toc-links');
    const tocHeading = document.querySelector('.toc-heading');
    const toggleBar = document.querySelector('.legal-toc .margin-bottom-16');

    const headings = document.querySelectorAll('.legal-content-section h5, .legal-content-section .text-weight-xbold, .legal-content-section .legal-topic');

    if (!tocWrapper || !tocLinks || headings.length === 0) {
      console.warn("TOC script aborted: Elements missing.");
      return;
    }

    /* ---------------------------- slugify ---------------------------- */
    // Why: Section titles in the HTML are human text ("1. Introduction", "OUR PRIVACY PROMISE").
    // Valid fragment ids must be URL-safe and consistent with href="#..."; this turns title
    // text into ids like "1-introduction" so each .legal-content-section gets a stable id
    // that matches the generated TOC links.
    function slugify(text) {
      return text.toString().toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    tocLinks.innerHTML = '';
    const anchors = [];

    /* ---------------------------- build TOC links from headings ---------------------------- */
    // Why: Webflow may ship static links, but this keeps the TOC in sync with whatever
    // sections exist in the CMS: for each h5 / .legal-topic / .text-weight-xbold it sets
    // id on the parent .legal-content-section (your HTML already shows id="our-privacy-promise"
    // etc.), rebuilds <a class="legal-toc-link"> inside .legal-toc-links, smooth-scrolls with
    // offset for the sticky header, updates the URL hash, closes the mobile drawer, and records
    // { id, link } for the active-state observer below.
    headings.forEach(function (heading) {
      const text = heading.textContent.trim();
      if (!text) return;

      const section = heading.closest('.legal-content-section');
      const id = slugify(text);

      if (section) {
        section.setAttribute('id', id);
      } else {
        heading.setAttribute('id', id);
      }

      const a = document.createElement('a');
      a.href = '#' + id;
      a.className = 'legal-toc-link w-inline-block';
      a.innerHTML = '<p class="text-size-regular">' + text + '</p>';

      a.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        tocWrapper.classList.remove('is-open');

        if (tocHeading && window.innerWidth <= 991) {
          tocHeading.textContent = text;
        }

        const target = document.getElementById(id);
        if (target) {
          const offsetPx = parseFloat(getComputedStyle(document.documentElement).fontSize) * 13;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offsetPx;
          window.scrollTo({ top: top, behavior: 'smooth' });
          history.pushState(null, '', '#' + id);
        }
      });

      tocLinks.appendChild(a);
      anchors.push({ id: id, link: a });
    });

    /* ---------------------------- is mobile viewport ---------------------------- */
    // Why: Matches your CSS breakpoint (991px): on small screens .legal-toc is a sticky
    // dropdown; desktop keeps the links always visible. Same test everywhere avoids the header
    // label and outside-click logic running on desktop.
    const isMobile = function () { return window.innerWidth <= 991; };

    if (tocHeading && isMobile() && !tocWrapper.classList.contains('is-open')) {
      tocHeading.textContent = 'Jump to\u2026';
    }

    const observerOptions = { root: null, rootMargin: '0rem 0rem -60% 0rem', threshold: 0 };

    /* ---------------------------- intersection observer (active section) ---------------------------- */
    // Why: As the user scrolls through .legal-content-section blocks, we toggle .is-active on
    // the matching .legal-toc-link (styling in CSS). Observing each section’s id (same ids we
    // set in the build step) is more reliable than scroll listeners. On mobile, .toc-heading
    // shows the current section title instead of only "Jump to…".
    const observerCallback = function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          anchors.forEach(function (item) {
            const isActive = item.id === activeId;
            item.link.classList.toggle('is-active', isActive);

            if (isActive && isMobile() && tocHeading) {
              tocHeading.textContent = item.link.textContent.trim();
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    anchors.forEach(function (item) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    /* ---------------------------- mobile TOC toggle ---------------------------- */
    // Why: On mobile, the bar wrapping .toc-heading (.margin-bottom-16) is the tap target to
    // open/close the list in .legal-toc-links; .legal-toc gets .is-open and policy.css shows
    // or hides the links. Ignored on desktop where links are always visible.
    if (toggleBar) {
      toggleBar.addEventListener('click', function () {
        if (!isMobile()) return;
        tocWrapper.classList.toggle('is-open');
      });
    }

    /* ---------------------------- close TOC on outside click ---------------------------- */
    // Why: When the drawer is open, tapping anywhere outside .legal-toc (e.g. on
    // .legal-content-wrap) should collapse it — standard mobile menu behavior. Desktop is
    // skipped so we do not attach unnecessary work.
    document.addEventListener('click', function (e) {
      if (!isMobile()) return;
      if (!tocWrapper.contains(e.target)) {
        tocWrapper.classList.remove('is-open');
      }
    });
  }

  /* ---------------------------- run after window load ---------------------------- */
  // Why: Waits until images and other deferred resources have finished so layout (section
  // positions, sticky header height) is stable before we measure scroll targets and attach
  // observers. If the document is already fully loaded, runs initTOC immediately.
  if (document.readyState === 'complete') {
    initTOC();
  } else {
    window.addEventListener('load', initTOC);
  }
})();
