// Applies the selected language to text and accessible labels, and preserves the choice when storage is available.
import { translations } from "./translations.js";

export function createI18n(config) {
  const htmlLocales = { en_US: "en-US", es_419: "es-419" };
  const announcement = document.querySelector("#site-announcement");
  const listeners = new Set();
  let locale = config.defaultLocale;
  let storageAvailable = true;

  try {
    const savedLocale = localStorage.getItem(config.languageStorageKey);
    if (["en_US", "es_419"].includes(savedLocale)) locale = savedLocale;
  } catch (error) {
    storageAvailable = false;
  }

  if (!["en_US", "es_419"].includes(locale)) locale = "en_US";

  function translate(key, values = {}) {
    const template = translations[locale][key] ?? translations.en_US[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  }

  function applyLocale(nextLocale, persist = false) {
    if (!["en_US", "es_419"].includes(nextLocale)) return;
    locale = nextLocale;
    document.documentElement.lang = htmlLocales[locale];

    document.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = translate(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(element => {
      element.setAttribute("aria-label", translate(element.dataset.i18nAria));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(element => {
      element.setAttribute("alt", translate(element.dataset.i18nAlt));
    });
    document.querySelectorAll("[data-locale]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.locale === locale));
    });

    const numberFormat = new Intl.NumberFormat(htmlLocales[locale], {
      maximumFractionDigits: 0
    });
    document.querySelectorAll("[data-price]").forEach(element => {
      element.textContent = `PEN ${numberFormat.format(Number(element.dataset.price))}`;
    });

    const termsPage = document.body.dataset.page === "terms";
    document.title = translate(termsPage ? "terms.metaTitle" : "meta.title");
    const description = translate(termsPage ? "terms.description" : "meta.description");
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = description;

    if (persist) {
      try {
        localStorage.setItem(config.languageStorageKey, locale);
        storageAvailable = true;
      } catch (error) {
        storageAvailable = false;
      }
      announcement.textContent = translate(storageAvailable ? "language.changed" : "language.unsaved");
    }
    listeners.forEach(listener => listener());
  }

  document.querySelectorAll("[data-locale]").forEach(button => {
    button.addEventListener("click", () => applyLocale(button.dataset.locale, true));
  });

  applyLocale(locale);

  return {
    translate,
    getLocale: () => locale,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
