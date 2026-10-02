// Initializes translations, navigation, media, contact interactions and entrance animations.
import { siteConfig } from "./config.js";
import { createI18n } from "./i18n.js";
import { initNavigation } from "./navigation.js";
import { initMedia } from "./media.js";
import { initContact } from "./contact.js";
import { initAnimations } from "./animations.js";

const i18n = createI18n(siteConfig);
document.documentElement.classList.add("js-enabled");
initNavigation(i18n);
initMedia(siteConfig, i18n);
initContact(i18n);
initAnimations();
document.querySelectorAll("[data-current-year]").forEach(element => {
  element.textContent = new Date().getFullYear();
});
