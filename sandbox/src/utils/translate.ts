import br from "../../../src/assets/i18n/br.json";
import en from "../../../src/assets/i18n/en.json";

export type Language = "br" | "en";

export function getTranslation(lang: Language) {
  const dictionary = lang === "br" ? br : en;
  return function t(key: keyof typeof br) {
    return dictionary[key] || br[key] || key;
  };
}
