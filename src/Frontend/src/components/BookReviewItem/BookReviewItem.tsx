import { Button, Grid, Paper, Typography } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import { DateFormat } from "config/enums";
import moment from "moment";
import React, { useContext } from "react";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBookReview } from "store/types";
import { useStyles } from "styles";



interface BookReviewItemProps {
    bookReview: IBookReview;
}

export const BookReviewItem = ({bookReview}: BookReviewItemProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const context = useContext(AppContext);
    const authContext = useContext(AuthContext);
    const classes = useStyles();

    return (
        <>
            <Paper elevation={3} className={classes.paper}>
                <Grid container spacing={1}>
                    <Grid item xs={8}>
                        <Typography variant="h6" >{bookReview.title}</Typography>
                        <Typography variant="body2" >{translate("by")} {bookReview.username}</Typography>
                        { bookReview.rating && (
                            <Rating
                                value={bookReview.rating}
                                readOnly
                            />)}
                        <Typography variant="subtitle2">{bookReview.comment}</Typography>
                    </Grid>
                    <Grid container item xs={4} direction="column" justify="space-between" alignItems="flex-end" >
                        <Typography >{moment(bookReview.dateAdded).format(DateFormat.NO)}</Typography>
                        { bookReview.username == authContext.account?.name && (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={async () => await context.removeBookReview(bookReview)}>
                                {translate("delete")}
                            </Button>
                        )}
                    </Grid>

                </Grid>
            </Paper>
        </>
    );
};

export default BookReviewItem;