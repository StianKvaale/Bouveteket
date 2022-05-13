import { TextField } from "@material-ui/core";
import { Autocomplete, createFilterOptions } from "@material-ui/lab";
import React, { useContext } from "react";
import { AppContext } from "store/appContext";
import { LanguageContext } from "store/languageContext";
import { IBook, ICategory } from "store/types";
import { trimAndOneWhitespaceString } from "utils/helpers";

interface AutocompleteCategoriesProps {
    book: IBook;
    setBook: (book: IBook) => void;
}

interface CategoryOptionType extends ICategory {
    inputValue?: string;
}

export const AutocompleteCategories = ({book, setBook}: AutocompleteCategoriesProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const context = useContext(AppContext);

    const filter = createFilterOptions<CategoryOptionType>();
    const categoryOptions = context.categories
        .filter(category => !book.categories.find(c => c.title === category.title))
        .sort((categoryA, categoryB) => categoryA.title.toLowerCase() > categoryB.title.toLowerCase() ? 1 : -1) as CategoryOptionType[] ?? [];

    const updateCategories = (values: (string | CategoryOptionType)[]) => {
        const lastElement = values[values.length - 1];

        // Bruker trykket på Enter
        if(typeof lastElement === "string") {
            const title = trimAndOneWhitespaceString(lastElement);
            const categoryExists = book.categories.some(category => category.title.toLowerCase() === title.toLowerCase());
            if(!categoryExists)
                setBook({...book, categories: [...book.categories, { title } as ICategory]});
        }
        // Bruker trykket på "Legg til"
        else if(lastElement?.inputValue) {
            const title = trimAndOneWhitespaceString(lastElement.inputValue);
            const categoryExists = book.categories.some(category => category.title.toLowerCase() === title.toLowerCase());
            if(!categoryExists)
                setBook({...book, categories: [...book.categories, { title } as ICategory]});
        }
        // Bruker valgte eksisterende kategori fra listen
        else {
            setBook({...book, categories: values as ICategory[]});
        }
    };

    return (
        <Autocomplete
            multiple
            id="categories"
            options={categoryOptions}
            value={book.categories as CategoryOptionType[]}
            getOptionLabel={(category) => category.title}
            freeSolo
            clearOnBlur
            onChange={(event, values) => updateCategories(values)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={translate("categories")}
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
                        title: `${translate("add")} "${params.inputValue}"`,
                    });
                }

                return filtered;
            }}
        />
    );
};