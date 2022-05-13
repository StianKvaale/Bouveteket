import { TextField } from "@material-ui/core";
import { Autocomplete, createFilterOptions } from "@material-ui/lab";
import React, { useContext } from "react";
import { AppContext } from "store/appContext";
import { LanguageContext } from "store/languageContext";
import { IBook } from "store/types";
import { getListOfUniqueItems, trimAndOneWhitespaceString } from "utils/helpers";

interface AutocompleteLanguagesProps {
    book: IBook;
    setBook: (book: IBook) => void;
}

interface LanguageOptionType {
    languageCode: string;
    inputValue?: string;
}

export const AutocompleteLanguages = ({book, setBook}: AutocompleteLanguagesProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const context = useContext(AppContext);

    const filter = createFilterOptions<LanguageOptionType>();

    const allLanguages: LanguageOptionType[] = [];
    context.books.map((b) => {
        if (b.language) {
            allLanguages.push({ languageCode: b.language });
        }
    });
    const LanguageOptions = getListOfUniqueItems(allLanguages, "languageCode")
        .filter(language => !(book.language === language.languageCode))
        .sort((a, b) => a.languageCode.toLowerCase() > b.languageCode.toLowerCase() ? 1 : -1);

    const updateLanguage = (value: (string | LanguageOptionType | null)) => {
        // Bruker trykket på Enter
        if(typeof value === "string") {
            const language = trimAndOneWhitespaceString(value);
            const languageExists = (book.language?.toLowerCase() === language.toLowerCase());
            if(!languageExists)
                setBook({...book, language:  language });
        }
        // Bruker trykket på "Legg til"
        else if(value?.inputValue) {
            const language = trimAndOneWhitespaceString(value.inputValue);
            const languageExists = (book.language?.toLowerCase() === language.toLowerCase());
            if(!languageExists)
                setBook({...book, language: language });
        }
        // Bruker valgte eksisterende kategori fra listen
        else if (value?.languageCode) {
            setBook({...book, language: trimAndOneWhitespaceString(value.languageCode) });
        } else {
            setBook({...book, language: undefined});
        }
    };

    return (
        <Autocomplete
            id="languages"
            options={LanguageOptions}
            value={{languageCode: book.language} as LanguageOptionType}
            getOptionLabel={(language) => language.languageCode}
            freeSolo
            clearOnBlur
            onChange={(event, value) => updateLanguage(value)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={translate("language")}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                />
            )}
            filterOptions={(options, params) => {
                const filtered = filter(options, params);

                if (params.inputValue) {
                    filtered.push({
                        inputValue: params.inputValue,
                        languageCode: `${translate("add")} "${params.inputValue}"`,
                    });
                }

                return filtered;
            }}
        />
    );
};