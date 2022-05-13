import { Button, Container, Grid, Paper, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { BookDetailsHeader } from "components/BookDetails/BookDetailsHeader";
import { BookRentalStatus } from "components/BookRentalStatus";
import { BookReviews } from "components/BookReviews";
import { ConfirmRemoveBookDialog } from "components/ConfirmRemoveBookDialog";
import { LoadingSpinner } from "components/LoadingSpinner";
import { NoContentFound } from "components/NoContentFound";
import { Paths } from "config/enums";
import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBook } from "store/types";
import { useStyles } from "styles";
import { isBorrower, isOwner } from "utils/bookUtils";

export const BookDetails: React.FC = (): JSX.Element => {
    const context = useContext(AppContext);
    const authContext = useContext(AuthContext);
    const history = useHistory();
    const { dispatch: { translate }} = useContext(LanguageContext);
    const { id } = useParams<{ id: string}>();
    const [book, setBook] = useState<IBook>();
    const [displayAlert, setDisplayAlert] = useState(false);
    const classes = useStyles();
    const bookId = parseInt(id);
    const [displayDialog, setDisplayDialog] = useState<boolean>(false);
    const [bookNotActive, setBookNotActive] = useState<boolean>(false);

    useEffect(() => {
        const book = context.getBook(bookId);
        if(book){
            setBook(book);
        }
    }, [context.books]);

    // Redirects if book is deleted
    useEffect(() => {
        if (bookNotActive == true) {
            history.push(Paths.Overview);
        }
    }, [bookNotActive]);

    const borrowBook = async () => {
        if (book){
            await context.onBorrowBook(book.id)
                .then(() => { history.push(Paths.Loans, { displayAlert: true }); })
                .catch(() => { setDisplayAlert(true); });
        }
    };

    const canBorrowBook = () => {
        if(    book == null
            || !book.active
            || book.quantity === 0
            || book.availableQuantity === 0){
            return false;
        }
        return !isBorrower(book, authContext.account?.localAccountId);
    };

    const canDeliverBook = () => {
        return (book && book.active && isBorrower(book, authContext.account?.localAccountId));
    };

    if(context.isLoadingBooks){
        return <LoadingSpinner />;
    }
    else if(!book){
        return <NoContentFound />;
    }

    return (
        <Container>
            <Snackbar open={displayAlert} autoHideDuration={5000} onClose={() => setDisplayAlert(false)}>
                <Alert severity="error" onClose={() => setDisplayAlert(false)}>
                    {translate("errorAlertLoan")}
                </Alert>
            </Snackbar>

            <ConfirmRemoveBookDialog
                displayDialog={displayDialog}
                setDisplayDialog={setDisplayDialog}
                chosenBook={book}
                setBookNotActive={setBookNotActive} />

            <Paper elevation={3} className={classes.paper}>
                <BookDetailsHeader book={book}/>

                <Grid container className={`${classes.centerVertical} ${classes.bigMargin}`}>
                    <Grid item>
                        <BookRentalStatus book={book}/>
                    </Grid>

                    <Grid item className={classes.marginLeftAuto}>
                        <Grid container justify="flex-end" spacing={2}>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => history.goBack()}>
                                    {translate("goBack")}
                                </Button>
                            </Grid>
                            {isOwner(book, authContext.account?.localAccountId) && (
                                <>
                                    <Grid item>
                                        <Button
                                            aria-label={translate("change")}
                                            color="primary"
                                            variant="contained"
                                            onClick={() => history.push({ pathname: Paths.Edit.replace(":id", book.id.toString())})}>
                                            {translate("change")}
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            aria-label={translate("removeBook")}
                                            color="primary"
                                            variant="contained"
                                            onClick={() => setDisplayDialog(true)}>
                                            {translate("removeBook")}
                                        </Button>
                                    </Grid>
                                </>
                            )}
                            {book.active && (
                                <Grid item>
                                    {(canDeliverBook()) ? (
                                        <Button
                                            color="secondary"
                                            variant="contained"
                                            aria-label={translate("deliver")}
                                            onClick={async () => await context.onReturnBook(book.id)}>
                                            {translate("deliver")}
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled={!canBorrowBook()}
                                            color="secondary"
                                            variant="contained"
                                            aria-label="borrow"
                                            onClick={async () => await borrowBook()}>
                                            {canBorrowBook() ? translate("borrowNow") : translate("isUnavailable")}
                                        </Button>
                                    )}
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            <BookReviews
                book={book}
            />
        </Container>
    );
};

export default BookDetails;
