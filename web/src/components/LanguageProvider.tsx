import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createTranslator, detectDeviceLanguage, LanguageContext, readLanguageChoice, saveLanguageChoice, type LanguageChoice, type LanguageSettings } from "../lib/i18n";

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [choice, setChoice] = useState<LanguageChoice>(readLanguageChoice);
    const [deviceLanguage, setDeviceLanguage] = useState(detectDeviceLanguage);

    let language = deviceLanguage;
    if (choice !== "auto") {
        language = choice;
    }

    useEffect(() => {
        const followDeviceLanguage = () => setDeviceLanguage(detectDeviceLanguage());
        window.addEventListener("languagechange", followDeviceLanguage);
        return () => window.removeEventListener("languagechange", followDeviceLanguage);
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const settings = useMemo<LanguageSettings>(() => {
        function changeChoice(nextChoice: LanguageChoice) {
            saveLanguageChoice(nextChoice);
            setChoice(nextChoice);
        }

        return { ...createTranslator(language), language, choice, changeChoice };
    }, [language, choice]);

    return <LanguageContext.Provider value={settings}>{children}</LanguageContext.Provider>;
}
