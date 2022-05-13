import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthContext } from "store/authContext";
import en from '../utils/languages/en.json';
import no from '../utils/languages/no.json';

interface LanguageProvider {
  selectedLanguage: string;
}

interface LanguageStateProps {
  children: ReactNode;
}

interface ContextProps {
  state: LanguageProvider;
  dispatch: {
    translate: (key: string) => string;
  }
}

export const LanguageContext = createContext({} as ContextProps);

export const LanguageProvider = ({ children }: LanguageStateProps): JSX.Element => {
    const { user } = useContext(AuthContext);
    const [state, setState] = useState<LanguageProvider>({ selectedLanguage: user.language ? "EN" : "NO" });
    const [languageData, setLanguageData] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const newLanguage = user.language ? "EN" : "NO";
        setState({ selectedLanguage: newLanguage });

        if (newLanguage === "NO") {
            setLanguageData(no);
        } else if (newLanguage === "EN") {
            setLanguageData(en);
        } else {
            setLanguageData({});
            throw new Error("Selected language not supported");
        }
    }, [user.language]);

    const translate = (key: string): string => {
        return languageData[key] ?? key;
    };

    return(
        <LanguageContext.Provider value={{ state, dispatch: { translate }}}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageProvider;