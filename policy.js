(function () {
  function initTOC() {
    const tocWrapper = document.querySelector('.legal-toc');
    const tocLinks = document.querySelector('.legal-toc-links');
    const headings = document.querySelectorAll('.legal-content-section h5, .legal-content-section .text-weight-xbold, .legal-content-section .legal-topic');

    // 1. Safety check: ensure elements exist before running
    if (!tocWrapper || !tocLinks || headings.length === 0) {
      console.warn("TOC script aborted: Could not find required elements or headings.");
      return;
    }

    // Force display block on mobile just in case Webflow natively hides it
    if (window.innerWidth <= 991) {
      tocWrapper.style.display = 'block';
    }

    function slugify(text) {
      return text.toString().toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    // Clear placeholder links
    tocLinks.innerHTML = '';
    const anchors = [];

    // Build the links
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

        // Close mobile dropdown
        tocWrapper.classList.remove('is-open');

        // Update heading text
        const mobileHeading = document.querySelector('.toc-heading');
        if (mobileHeading && window.innerWidth <= 991) {
          mobileHeading.textContent = text;
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

    // Mobile heading default text
    const tocHeading = document.querySelector('.toc-heading');
    const isMobile = function () { return window.innerWidth <= 991; };

    if (tocHeading && isMobile()) {
      tocHeading.textContent = 'Jump to\u2026';
    }

    // Active state observer
    const observerOptions = { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 };
    const observerCallback = function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          anchors.forEach(function (item) {
            item.link.classList.toggle('is-active', item.id === activeId);
            if (item.id === activeId && isMobile() && tocHeading) {
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

    // Mobile dropdown toggle
    tocWrapper.addEventListener('click', function (e) {
      if (window.innerWidth > 991) return;
      const clickedLink = e.target.closest('.legal-toc-link');
      if (clickedLink) {
        tocWrapper.classList.remove('is-open');
        return;
      }
      tocWrapper.classList.toggle('is-open');
    });

    document.addEventListener('click', function (e) {
      if (window.innerWidth > 991) return;
      if (!tocWrapper.contains(e.target)) {
        tocWrapper.classList.remove('is-open');
      }
    });
  }

  // 2. Execution logic: handle Webflow's script loading timing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTOC);
  } else {
    initTOC();
  }
})();