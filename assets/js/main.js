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
