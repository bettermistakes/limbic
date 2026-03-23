document.addEventListener('DOMContentLoaded', function () {
  
  const tocLinks = document.querySelector('.legal-toc-links');
  
  /* UPDATED: Target the h5 (intro), the bold divs, AND the .legal-topic divs */
  const headings = document.querySelectorAll('.legal-content-section h5, .legal-content-section .text-weight-xbold, .legal-content-section .legal-topic');

  if (!tocLinks || headings.length === 0) return;

  function slugify(text) {
    return text.toString().toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // Clear the placeholder link(s)
  tocLinks.innerHTML = '';
  const anchors = [];

  headings.forEach(function (heading) {
    const text = heading.textContent.trim();
    if (!text) return;

    // Assign a stable id to the heading's parent .legal-content-section
    const section = heading.closest('.legal-content-section');
    const id = slugify(text);

    if (section) {
      section.setAttribute('id', id);
    } else {
      heading.setAttribute('id', id);
    }

    // Build TOC link
    const a = document.createElement('a');
    a.href = '#' + id;
    a.className = 'legal-toc-link w-inline-block';
    a.innerHTML = '<p class="text-size-regular">' + text + '</p>';

    // Smooth scroll with offset (navbar 6rem + sticky TOC ~3rem + breathing = 13rem)
    a.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Close the mobile dropdown inside the link click
      var wrapper = document.querySelector('.legal-toc');
      if (wrapper) wrapper.classList.remove('is-open');

      // Update heading text to the clicked section on mobile
      var mobileHeading = document.querySelector('.toc-heading');
      if (mobileHeading && window.innerWidth <= 991) {
        mobileHeading.textContent = text;
      }

      var target = document.getElementById(id);
      if (target) {
        var offsetPx = parseFloat(getComputedStyle(document.documentElement).fontSize) * 13;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offsetPx;
        window.scrollTo({ top: top, behavior: 'smooth' });
        history.pushState(null, '', '#' + id);
      }
    });

    tocLinks.appendChild(a);
    anchors.push({ id: id, link: a });
  });

  // --- Mobile heading default text ---
  var tocHeading = document.querySelector('.toc-heading');
  var isMobile  = function () { return window.innerWidth <= 991; };

  if (tocHeading && isMobile()) {
    tocHeading.textContent = 'Jump to\u2026';
  }

  // --- Active state via IntersectionObserver ---
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60% 0px',
    threshold: 0
  };

  const observerCallback = function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        anchors.forEach(function (item) {
          item.link.classList.toggle('is-active', item.id === activeId);
          // Update mobile dropdown heading with the active section name
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

  // --- Mobile TOC Dropdown Toggle (≤ 991px) ---
  var tocWrapper = document.querySelector('.legal-toc');
  if (tocWrapper) {
    tocWrapper.addEventListener('click', function (e) {
      // Only act as dropdown on mobile/tablet
      if (window.innerWidth > 991) return;

      var clickedLink = e.target.closest('.legal-toc-link');
      if (clickedLink) {
        tocWrapper.classList.remove('is-open');
        return;
      }
      tocWrapper.classList.toggle('is-open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (window.innerWidth > 991) return;
      if (!tocWrapper.contains(e.target)) {
        tocWrapper.classList.remove('is-open');
      }
    });
  }

});