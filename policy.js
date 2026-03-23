(function () {
  function initTOC() {
    // Target your existing Webflow elements
    const tocWrapper = document.querySelector('.legal-toc');
    const tocLinks = document.querySelector('.legal-toc-links');
    const tocHeading = document.querySelector('.toc-heading'); 
    const toggleBar = document.querySelector('.legal-toc .margin-bottom-16'); 

    const headings = document.querySelectorAll('.legal-content-section h5, .legal-content-section .text-weight-xbold, .legal-content-section .legal-topic');

    if (!tocWrapper || !tocLinks || headings.length === 0) {
      console.warn("TOC script aborted: Elements missing.");
      return;
    }

    function slugify(text) {
      return text.toString().toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    tocLinks.innerHTML = '';
    const anchors = [];

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

        // Update text on mobile
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

    const isMobile = function () { return window.innerWidth <= 991; };

    // Set initial "Jump to..." on load
    if (tocHeading && isMobile() && !tocWrapper.classList.contains('is-open')) {
      tocHeading.textContent = 'Jump to\u2026';
    }

    // Active state observer
    const observerOptions = { root: null, rootMargin: '0rem 0rem -60% 0rem', threshold: 0 };
    const observerCallback = function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          anchors.forEach(function (item) {
            const isActive = item.id === activeId;
            item.link.classList.toggle('is-active', isActive);
            
            // Keep mobile header text synced to active section
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

    // Mobile dropdown toggle logic
    if (toggleBar) {
      toggleBar.addEventListener('click', function () {
        if (!isMobile()) return;
        tocWrapper.classList.toggle('is-open');
      });
    }

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!isMobile()) return;
      if (!tocWrapper.contains(e.target)) {
        tocWrapper.classList.remove('is-open');
      }
    });
  }

  // Handle Webflow script execution timing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTOC);
  } else {
    initTOC();
  }
})();