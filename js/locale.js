// locale.js
import { currentRegion } from "./config.js";

let translations = {};

export async function loadLocale(region = currentRegion) {
  try {
    const res = await fetch(`./locales/${region}.json`);
    if (!res.ok) throw new Error("Locale not found");
    translations = await res.json();
  } catch (err) {
    console.warn("Failed to load locale, falling back to English", err);
    const res = await fetch(`./locales/en.json`);
    translations = await res.json();
  }
}

export function t(key) {
  return translations[key] || key;
}
