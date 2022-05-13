import { TextField } from "@material-ui/core";
import { Autocomplete, createFilterOptions } from "@material-ui/lab";
import React, { useContext } from "react";
import { AppContext } from "store/appContext";
import { LanguageContext } from "store/languageContext";
import { EditBookFormError, IAuthor, IBook } from "store/types";
import { getLastName, requiredFieldLabel, trimAndOneWhitespaceString } from "utils/helpers";

interface AutocompleteAuthorsProps {
    book: IBook;
    setBook: (book: IBook) => void;
    error: EditBookFormError;
    setError: (error: EditBookFormError) => void;
}

interface AuthorOptionType extends IAuthor {
    inputValue?: string;
}

export const AutocompleteAuthors = ({book, setBook, error, setError}: AutocompleteAuthorsProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const context = useContext(AppContext);
    const filter = createFilterOptions<AuthorOptionType>();
    const authorOptions = context.authors
        .filter(author => !book.authors.find(a => a.name === author.name))
        .sort((authorA, authorB) => getLastName(authorA.name).toLowerCase() > getLastName(authorB.name).toLowerCase() ? 1 : -1) as AuthorOptionType[] ?? [];

    const updateAuthors = (values: (string | AuthorOptionType)[]) => {
        const authorsError = values.length > 0 ? false : true;
        setError({...error, authors: authorsError});

        const lastElement = values[values.length - 1];

        // Bruker trykket på Enter
        if(typeof lastElement === "string") {
            const name = trimAndOneWhitespaceString(lastElement);
            const authorExists = book.authors.some(author => author.name.toLowerCase() === name.toLowerCase());
            if(!authorExists)
                setBook({...book, authors: [...book.authors, { name } as IAuthor]});
        }
        // Bruker trykket på "Legg til"
        else if(lastElement?.inputValue) {
            const name = trimAndOneWhitespaceString(lastElement.inputValue);
            const authorExists = book.authors.some(author => author.name.toLowerCase() === name.toLowerCase());
            if(!authorExists)
                setBook({...book, authors: [...book.authors, { name } as IAuthor]});
        }
        // Bruker valgte eksisterende forfatter fra listen
        else {
            setBook({...book, authors: values as IAuthor[]});
        }
    };

    return (
        <Autocomplete
            multiple
            id="authors"
            options={authorOptions}
            value={book.authors as AuthorOptionType[]}
            getOptionLabel={(author) => author.name}
            freeSolo
            clearOnBlur
            onChange={(event, values) => updateAuthors(values)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    error={error.authors}
                    helperText={error.authors ? translate("atLeastOneAuthorRequired") : ""}
                    label={requiredFieldLabel(translate("authors"))}
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
                        name: `${translate("add")} "${params.inputValue}"`,
                    });
                }

                return filtered;
            }}
        />
    );
};