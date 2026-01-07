/**
 * Dictionary loader
 */

import type { Dictionary, Locale } from "../types";
import { enDictionary } from "./en";
import { esDictionary } from "./es";
import { frDictionary } from "./fr";

const dictionaries: Record<Locale, Dictionary> = {
  en: enDictionary,
  es: esDictionary,
  fr: frDictionary,
};

export function loadDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}

// English dictionary
export { enDictionary } from "./en";
