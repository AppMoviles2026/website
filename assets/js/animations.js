// Reveals page content once and respects reduced motion preferences.
export function initAnimations() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const targets = [...document.querySelectorAll(
    ".hero-copy > *, .hero-grid > figure, .section-heading, .feature-card, .audience-grid > *, .workflow > h3, .steps > li, .plan-card, .plans-note, .contact-copy > *, .contact-form, .about-intro > *, .terms-copy > *, .footer-top > *, .footer-bottom > *"
  )];
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

  targets.forEach(element => {
    const direction = element.matches("figure") ? "right" : element.matches(".audience-copy") ? "left" : "up";
    element.dataset.reveal = direction;
    observer.observe(element);
  });
  document.querySelector(".site-header").classList.add("header-enter");
  document.addEventListener("focusin", event => {
    const target = event.target.closest("[data-reveal]");
    if (!target) return;
    target.classList.add("is-visible");
    observer.unobserve(target);
  });
  reducedMotion.addEventListener("change", event => {
    if (!event.matches) return;
    targets.forEach(element => element.classList.add("is-visible"));
    observer.disconnect();
  });
}
