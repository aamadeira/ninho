import { createContext, useContext } from "react";
import { en } from "../translations/en";
import { pt } from "../translations/pt";

export type Language = "en" | "pt";
export type LanguageChoice = Language | "auto";
export type TranslationKey = keyof typeof en;
export type Translations = Record<TranslationKey, string | PluralText>;
export type TranslationValues = Record<string, string | number>;
export type Translate = (key: TranslationKey, values?: TranslationValues) => string;

interface PluralText {
    one: string;
    other: string;
}

export interface Translator {
    t: Translate;
    locale: string;
}

export interface LanguageSettings extends Translator {
    language: Language;
    choice: LanguageChoice;
    changeChoice: (choice: LanguageChoice) => void;
}

export const languages: Language[] = ["en", "pt"];

export const languageNames: Record<Language, string> = {
    en: "English",
    pt: "Português"
};

const translations: Record<Language, Translations> = { en, pt };
const locales: Record<Language, string> = { en: "en-GB", pt: "pt-PT" };
const storageKey = "ninho-language";

export const LanguageContext = createContext<LanguageSettings | null>(null);

export function useTranslation(): LanguageSettings {
    const settings = useContext(LanguageContext);
    if (!settings) {
        throw new Error("useTranslation needs a LanguageProvider above it");
    }

    return settings;
}

function isLanguage(value: string | null): value is Language {
    return value === "en" || value === "pt";
}

export function readLanguageChoice(): LanguageChoice {
    try {
        const storedChoice = localStorage.getItem(storageKey);
        if (isLanguage(storedChoice)) {
            return storedChoice;
        }
    } catch {
        return "auto";
    }

    return "auto";
}

export function saveLanguageChoice(choice: LanguageChoice) {
    try {
        if (choice === "auto") {
            localStorage.removeItem(storageKey);
        } else {
            localStorage.setItem(storageKey, choice);
        }
    } catch {
        return;
    }
}

export function detectDeviceLanguage(): Language {
    for (const languageTag of navigator.languages) {
        const baseLanguage = languageTag.toLowerCase().split("-")[0];
        if (isLanguage(baseLanguage)) {
            return baseLanguage;
        }
    }

    return "en";
}

function fillIn(text: string, values: TranslationValues): string {
    let filledText = text;
    for (const [name, value] of Object.entries(values)) {
        filledText = filledText.replaceAll(`{${name}}`, String(value));
    }

    return filledText;
}

export function createTranslator(language: Language): Translator {
    const locale = locales[language];
    const pluralRules = new Intl.PluralRules(locale);

    function t(key: TranslationKey, values: TranslationValues = {}): string {
        const text = translations[language][key];
        if (typeof text === "string") {
            return fillIn(text, values);
        }

        const pluralForm = pluralRules.select(Number(values.count ?? 0));
        if (pluralForm === "one") {
            return fillIn(text.one, values);
        }

        return fillIn(text.other, values);
    }

    return { t, locale };
}
