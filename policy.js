(function () {
  function initTOC() {
    // 1. Target both desktop and mobile containers
    const desktopLinksContainer = document.querySelector('.legal-toc-links');
    
    const mobileWrapper = document.querySelector('.mobile-toc-wrap');
    const mobileLinksContainer = document.querySelector('.mobile-toc-links');
    const mobileToggleText = document.querySelector('.mobile-toc-toggle-text');

    const headings = document.querySelectorAll('.legal-content-section h5, .legal-content-section .text-weight-xbold, .legal-content-section .legal-topic');

    if (headings.length === 0) {
      console.warn("TOC script aborted: No headings found.");
      return;
    }

    function slugify(text) {
      return text.toString().toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    // Clear placeholders
    if (desktopLinksContainer) desktopLinksContainer.innerHTML = '';
    if (mobileLinksContainer) mobileLinksContainer.innerHTML = '';
    
    const anchors = [];

    // Build the links for both containers
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

      // Helper function to create the actual link element
      function createLinkObj() {
        const a = document.createElement('a');
        a.href = '#' + id;
        a.className = 'legal-toc-link w-inline-block';
        a.innerHTML = '<p class="text-size-regular">' + text + '</p>';

        a.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          // Close mobile dropdown & update text
          if (mobileWrapper) mobileWrapper.classList.remove('is-open');
          if (mobileToggleText && window.innerWidth <= 991) {
            mobileToggleText.textContent = text;
          }

          const target = document.getElementById(id);
          if (target) {
            const offsetPx = parseFloat(getComputedStyle(document.documentElement).fontSize) * 13;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offsetPx;
            window.scrollTo({ top: top, behavior: 'smooth' });
            history.pushState(null, '', '#' + id);
          }
        });
        return a;
      }

      // Inject into desktop
      if (desktopLinksContainer) {
        const dLink = createLinkObj();
        desktopLinksContainer.appendChild(dLink);
        anchors.push({ id: id, link: dLink });
      }
      
      // Inject into mobile
      if (mobileLinksContainer) {
        const mLink = createLinkObj();
        mobileLinksContainer.appendChild(mLink);
        anchors.push({ id: id, link: mLink });
      }
    });

    // Mobile heading default text
    if (mobileToggleText && !mobileToggleText.textContent.trim()) {
      mobileToggleText.textContent = 'Jump to\u2026';
    }

    // Active state observer
    const observerOptions = { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 };
    const observerCallback = function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute('id');
          anchors.forEach(function (item) {
            const isActive = item.id === activeId;
            item.link.classList.toggle('is-active', isActive);
            
            // Sync mobile header text to the active section
            if (isActive && window.innerWidth <= 991 && mobileToggleText) {
              mobileToggleText.textContent = item.link.textContent.trim();
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
    if (mobileWrapper) {
      // Find the toggle button inside the wrapper, or fallback to clicking the wrapper itself
      const toggleBtn = mobileWrapper.querySelector('.mobile-toc-toggle') || mobileWrapper;
      
      toggleBtn.addEventListener('click', function (e) {
        if (window.innerWidth > 991) return;
        
        // Prevent toggle if they clicked an actual link
        if (e.target.closest('.legal-toc-link')) {
          mobileWrapper.classList.remove('is-open');
          return;
        }
        mobileWrapper.classList.toggle('is-open');
      });

      // Close when clicking outside
      document.addEventListener('click', function (e) {
        if (window.innerWidth > 991) return;
        if (!mobileWrapper.contains(e.target)) {
          mobileWrapper.classList.remove('is-open');
        }
      });
    }
  }

  // Execution logic: handle Webflow's script loading timing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTOC);
  } else {
    initTOC();
  }
})();