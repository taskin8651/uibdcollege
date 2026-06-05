// DOM references used across menu, search, tabs and animation features.
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const searchTrigger = document.getElementById("searchTrigger");
const searchModal = document.getElementById("searchModal");
const closeSearch = document.getElementById("closeSearch");
const navLinks = document.querySelectorAll(".nav-inner a");
const dropdownButtons = document.querySelectorAll(".nav-drop");

// Mobile menu drawer: opens/closes the full navigation on small screens.
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuToggle.innerHTML = isOpen ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      document.querySelectorAll(".has-dropdown.open").forEach((item) => item.classList.remove("open"));
      menuToggle.setAttribute("aria-label", "Open menu");
      menuToggle.innerHTML = '<i class="bi bi-list"></i>';
    });
  });
}

// Dropdown menu behavior: desktop can click open, mobile opens one group at a time.
dropdownButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const parent = button.closest(".has-dropdown");
    if (!parent) return;

    if (window.innerWidth <= 1024) {
      document.querySelectorAll(".has-dropdown.open").forEach((item) => {
        if (item !== parent) item.classList.remove("open");
      });
      parent.classList.toggle("open");
      return;
    }

    parent.classList.toggle("open");
  });
});

// jQuery section sliders: arrows, dots, loop and mouse/touch drag support.
if (window.jQuery) {
  $(".js-slider").each(function () {
    const $slider = $(this);
    const $track = $slider.find(".slider-track");
    const $items = $track.children();
    const $prev = $slider.find(".slider-btn.prev");
    const $next = $slider.find(".slider-btn.next");
    let currentIndex = 0;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let isDragging = false;
    let autoplayTimer = null;

    if (!$track.length || !$items.length) return;

    const getGap = () => Number.parseFloat($track.css("gap")) || 0;
    const getStep = () => $items.eq(0).outerWidth() + getGap();
    const getMaxIndex = () => Math.max(0, Math.ceil(($track[0].scrollWidth - $track.outerWidth()) / getStep()));

    const goTo = (index) => {
      const maxIndex = getMaxIndex();
      currentIndex = index < 0 ? maxIndex : index > maxIndex ? 0 : index;
      $track.stop(true).animate({ scrollLeft: currentIndex * getStep() }, 420);
      updateDots();
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (getMaxIndex() <= 0) return;
      autoplayTimer = window.setInterval(() => goTo(currentIndex + 1), 2800);
    };

    const stopAutoplay = () => {
      if (!autoplayTimer) return;
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    const buildDots = () => {
      $slider.find(".slider-dots").remove();
      const maxIndex = getMaxIndex();
      if (maxIndex <= 0) return;

      const $dots = $('<div class="slider-dots" aria-label="Slider pagination"></div>');
      for (let i = 0; i <= maxIndex; i += 1) {
        const $dot = $('<button class="slider-dot" type="button" aria-label="Go to slide"></button>');
        $dot.on("click", () => goTo(i));
        $dots.append($dot);
      }
      $slider.append($dots);
      updateDots();
    };

    const updateDots = () => {
      const $dots = $slider.find(".slider-dot");
      $dots.removeClass("active").eq(currentIndex).addClass("active");
    };

    $prev.on("click", () => goTo(currentIndex - 1));
    $next.on("click", () => goTo(currentIndex + 1));

    $slider.on("mouseenter focusin", stopAutoplay);
    $slider.on("mouseleave focusout", startAutoplay);

    $track.on("scroll", () => {
      currentIndex = Math.round($track.scrollLeft() / getStep());
      updateDots();
    });

    $track.on("mousedown touchstart", (event) => {
      isDragging = true;
      stopAutoplay();
      dragStartX = event.pageX || event.originalEvent.touches?.[0]?.pageX || 0;
      dragStartScroll = $track.scrollLeft();
      $track.addClass("is-dragging");
    });

    $(document).on("mousemove touchmove", (event) => {
      if (!isDragging) return;
      const pageX = event.pageX || event.originalEvent.touches?.[0]?.pageX || 0;
      $track.scrollLeft(dragStartScroll - (pageX - dragStartX));
    });

    $(document).on("mouseup touchend", () => {
      if (!isDragging) return;
      isDragging = false;
      $track.removeClass("is-dragging");
      goTo(Math.round($track.scrollLeft() / getStep()));
      startAutoplay();
    });

    buildDots();
    startAutoplay();
    $(window).on("resize", () => {
      currentIndex = 0;
      buildDots();
      goTo(0);
      startAutoplay();
    });
  });
}

// Search modal helpers: open, focus input, close and update aria state.
const openSearch = () => {
  if (!searchModal) return;
  searchModal.classList.add("show");
  searchModal.setAttribute("aria-hidden", "false");
  const input = searchModal.querySelector("input");
  if (input) input.focus();
};

const hideSearch = () => {
  if (!searchModal) return;
  searchModal.classList.remove("show");
  searchModal.setAttribute("aria-hidden", "true");
};

if (searchTrigger) searchTrigger.addEventListener("click", openSearch);
if (closeSearch) closeSearch.addEventListener("click", hideSearch);
if (searchModal) {
  searchModal.addEventListener("click", (event) => {
    if (event.target === searchModal) hideSearch();
  });
}

// Global Escape key: closes search modal, nav drawer and open dropdowns.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideSearch();
    mainNav?.classList.remove("open");
    document.querySelectorAll(".has-dropdown.open").forEach((item) => item.classList.remove("open"));
    if (menuToggle) menuToggle.innerHTML = '<i class="bi bi-list"></i>';
  }
});

// Notice tabs: switches between General, Admission, Exam and IQAC notices.
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    panels.forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab)?.classList.add("active");
  });
});

// Scroll reveal: fades sections/cards into view as the user scrolls.
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

// Active navigation: highlights the current menu link while scrolling sections.
const sectionMap = Array.from(navLinks)
  .map((link) => {
    const id = link.getAttribute("href");
    if (!id || !id.startsWith("#")) return null;
    const section = document.querySelector(id);
    return section ? { link, section } : null;
  })
  .filter(Boolean);

if ("IntersectionObserver" in window && sectionMap.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.remove("active"));
        const match = sectionMap.find((item) => item.section === entry.target);
        if (match) match.link.classList.add("active");
      });
    },
    { threshold: 0.35 }
  );

  sectionMap.forEach((item) => navObserver.observe(item.section));
}

// Enquiry form demo: prevents reload and shows frontend-only success feedback.
document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    if (!button) return;
    const original = button.innerHTML;
    button.innerHTML = '<i class="bi bi-check2-circle"></i> Enquiry Ready';
    setTimeout(() => {
      button.innerHTML = original;
    }, 1800);
  });
});

// Hero student counters: animates live-site student statistics from 0 upward.
const countItems = document.querySelectorAll("[data-count]");

const animateCount = (element) => {
  const target = Number(element.dataset.count || 0);
  const duration = 1300;
  const start = performance.now();

  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toLocaleString("en-IN");
    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
};

if ("IntersectionObserver" in window && countItems.length) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  countItems.forEach((item) => countObserver.observe(item));
} else {
  countItems.forEach((item) => {
    item.textContent = Number(item.dataset.count || 0).toLocaleString("en-IN");
  });
}
