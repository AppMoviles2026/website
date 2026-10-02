// Controls section navigation, the mobile menu and keyboard interactions.
export function initNavigation(i18n) {
  const nav = document.querySelector("#main-nav");
  const toggle = document.querySelector("#menu-toggle");
  const header = document.querySelector(".header-inner");
  const mobileQuery = window.matchMedia("(max-width: 1000px)");
  const navLinks = [...nav.querySelectorAll("a")];
  const sections = [...document.querySelectorAll("main > section[id]")];
  let expanded = false;
  let scrollPending = false;

  function updateActiveSection() {
    if (!sections.length) return;
    const marker = header.getBoundingClientRect().height + Math.min(120, window.innerHeight * .2);
    let activeSection = sections[0];
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= marker) activeSection = section;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      activeSection = sections[sections.length - 1];
    }
    navLinks.forEach(link => {
      if (new URL(link.href).hash === `#${activeSection.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function renderMenu() {
    nav.hidden = mobileQuery.matches && !expanded;
    toggle.setAttribute("aria-expanded", String(mobileQuery.matches && expanded));
    toggle.setAttribute("aria-label", i18n.translate(expanded ? "menu.close" : "menu.open"));
  }

  function closeMenu(restoreFocus = false) {
    expanded = false;
    renderMenu();
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    expanded = !expanded;
    renderMenu();
    if (expanded) navLinks[0].focus();
  });
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeMenu();
      if (document.body.dataset.page === "home") {
        const target = document.querySelector(new URL(link.href).hash);
        if (target) {
          target.tabIndex = -1;
          target.focus({ preventScroll: true });
        }
      }
    });
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && expanded) closeMenu(true);
  });
  document.addEventListener("pointerdown", event => {
    if (expanded && !event.target.closest(".site-header")) closeMenu();
  });
  mobileQuery.addEventListener("change", () => closeMenu());
  window.addEventListener("scroll", () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      updateActiveSection();
      scrollPending = false;
    });
  }, { passive: true });
  window.addEventListener("resize", updateActiveSection);
  i18n.subscribe(() => {
    renderMenu();
    updateActiveSection();
  });
  renderMenu();
  updateActiveSection();
}
