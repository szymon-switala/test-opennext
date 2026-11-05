export const locales = ["pl", "en"] as const;
export type Locale = (typeof locales)[number];
export const slugs = ["pierwszy", "drugi", "trzeci", "czwarty", "piaty"];

const sentence =
  "Treść testowa o długości zbliżonej do typowej strony firmowej, z kilkoma akapitami, nagłówkami i listami, które dają realistyczny rozmiar dokumentu.";

export function paragraphs(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${i + 1}. ${sentence} ${sentence} ${sentence}`);
}
