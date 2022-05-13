import { Button, Grid, Paper, TextField, Typography } from "@material-ui/core";
import { Autocomplete, createFilterOptions } from "@material-ui/lab";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IAuthor, IBookWish } from "store/types";
import { useStyles } from "styles";
import { getAuthorsText } from "utils/bookUtils";
import { getLastName, trimAndOneWhitespaceString } from "utils/helpers";

const initialBookWishState: IBookWish = {
    id: 0, //default value on creation
    title: "",
    authors: "",
    comment: "",
    username: "",
    votes: 0,
    voters: []
};

interface AuthorOptionType extends IAuthor {
    inputValue?: string;
}

export  const AddWishForm = (): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const classes = useStyles();
    const authContext = useContext(AuthContext);
    const appContext = useContext(AppContext);
    const [bookWish, setBookWish] = useState<IBookWish>({...initialBookWishState});
    const [bookWishAuthors, setBookWishAuthors] = useState<IAuthor[]>([]);

    const authorOptions = appContext.authors.sort((authorA, authorB) => getLastName(authorA.name).toLowerCase() > getLastName(authorB.name).toLowerCase() ? 1 : -1) as AuthorOptionType[] ?? [];
    const filter = createFilterOptions<AuthorOptionType>();

    useEffect(() => {
        if (authContext.account?.localAccountId) {
            setBookWish({
                ...bookWish,
                username: authContext.account?.name ?? "",
                voters: [authContext.account?.localAccountId]
            });
        }
    }, [authContext.account]);

    const onPostWish = () => {
        appContext.addBookWish({
            ...bookWish,
            title: trimAndOneWhitespaceString(bookWish.title),
            authors: getAuthorsText(bookWishAuthors, translate),
            comment: trimAndOneWhitespaceString(bookWish.comment)
        });
        setBookWish({
            ...bookWish,
            title: "",
            authors: "",
            comment: ""
        });
        setBookWishAuthors([]);
    };

    return (
        <Grid item xs={12} >
            <Paper elevation={3} className={classes.paper}>
                <Typography variant="h6" >{translate("addBookWish")}</Typography>
                <Typography variant="body2" >{translate("by")} {bookWish.username}</Typography>

                <Grid container>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label={translate("title")}
                            value={bookWish.title}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBookWish({ ...bookWish, title: event.target.value })}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            id="authors"
                            options={authorOptions}
                            value={bookWishAuthors as AuthorOptionType[]}
                            getOptionLabel={(author) => author.name}
                            freeSolo
                            clearOnBlur
                            onChange={(event, values) => {
                                const lastElement = values[values.length - 1];
                                if (typeof lastElement === 'string') {
                                    const name = trimAndOneWhitespaceString(lastElement);
                                    setBookWishAuthors([...bookWishAuthors, { name: name } ]);
                                } else if (lastElement?.inputValue) {
                                    const name = trimAndOneWhitespaceString(lastElement.inputValue);
                                    setBookWishAuthors([...bookWishAuthors, { name: name } ]);
                                } else {
                                    setBookWishAuthors(values as IAuthor[]);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={translate("authors")}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth/>
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
                            }}/>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label={translate("comment")}
                            placeholder={translate("wishComment")}
                            value={bookWish.comment}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBookWish({ ...bookWish, comment: event.target.value })}
                            multiline
                            rows={3}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                        />
                    </Grid>
                </Grid>

                <Grid container justify="flex-end" className={classes.topMargin}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => onPostWish()}
                    >
                        {translate("post")}
                    </Button>
                </Grid>
            </Paper>
        </Grid>
    );
};
