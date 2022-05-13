import { Button, Grid, Paper, TextField, Typography } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBook, IBookReview } from "store/types";
import { useStyles } from "styles";


const initialBookReviewState: IBookReview = {
    id: 0,
    username: "",
    title: "",
    comment: "",
    rating: undefined,
    dateAdded: new Date(),
    bookId: NaN
};

interface AddBookReviewProps {
    book: IBook;
}

export const AddBookReviewForm = ({ book }: AddBookReviewProps): JSX.Element => {
    const classes = useStyles();
    const { dispatch: { translate }} = useContext(LanguageContext);
    const authContext = useContext(AuthContext);
    const appContext = useContext(AppContext);
    const [bookReview, setBookReview] = useState<IBookReview>({...initialBookReviewState});

    useEffect(() => {
        setBookReview({...bookReview, username: authContext.account?.name ?? ""});
    }, [authContext.account]);

    const onPostReview = () => {
        bookReview.bookId = book.id;
        appContext.addBookReview(bookReview);
        setBookReview({ ...bookReview, title: "", comment: "", rating: undefined });
    };

    return (
        <>
            <Paper elevation={3} className={classes.paper}>
                <Typography variant="h6" >{translate("addBookReview")}</Typography>
                <Typography variant="body2" >{translate("by")} {bookReview.username}</Typography>
                <Rating
                    value={bookReview.rating}
                    onChange={(event, newValue) => setBookReview({...bookReview, rating: newValue ?? undefined})}
                    name="bookReviewRating"
                />
                <Grid container>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label={translate("title")}
                            value={bookReview.title}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBookReview({ ...bookReview, title: event.target.value })}
                            variant="outlined"
                            margin="dense"
                            fullWidth
                        />
                    </Grid>

                </Grid>


                <TextField
                    label={translate("comment")}
                    value={bookReview.comment}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBookReview({ ...bookReview, comment: event.target.value })}
                    multiline
                    rows={4}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                />
                <Grid container justify="flex-end" className={classes.topMargin}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => onPostReview()}
                    >
                        {translate("post")}
                    </Button>
                </Grid>
            </Paper>
            <Grid>

            </Grid>
        </>
    );
};

export default AddBookReviewForm;
