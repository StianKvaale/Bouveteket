import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Grid, Paper, Snackbar, Tooltip, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { NoContentFound } from "components/NoContentFound";
import { AlertSeverity, Paths } from "config/enums";
import React, { useContext, useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBook, IBookWish } from "store/types";
import { useStyles } from "styles";
import { isOwner } from "utils/bookUtils";
import { EditBookForm } from '../EditBookForm';

const initialBookState: IBook = {
    id: 0,  //default value on creation
    title: "",
    authors: [],
    ean: "",
    imageUrl: undefined,
    categories: [],
    description: "",
    subTitle: "",
    language: undefined,
    quantity: 1,
    availableQuantity: 0,
    pages: undefined,
    published: undefined,
    rating: undefined,
    ratingCount: undefined,
    owners: [],
    dateAdded: new Date(),
    active: true,
    bookReviews: [],
    activeLoans: []
};
interface LocationState {
    book: IBook;
    isExistingBook: boolean;
}

interface UrlParameters {
    id: string;
}

export const BookRegistrationForm = (): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const context = useContext(AppContext);
    const authContext = useContext(AuthContext);
    const history = useHistory();
    const classes = useStyles();
    const location = useLocation<LocationState>();
    const params = useParams<UrlParameters>();
    const [book, setBook] = useState<IBook>({...initialBookState});
    const [addedBook, setAddedBook] = useState<IBook>({...initialBookState});
    const [bookBeforeChanges, setBookBeforeChanges] = useState<IBook>({...initialBookState});
    const [isExistingBook, setIsExistingBook] = useState(true);
    const [displayAlert, setDisplayAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>(AlertSeverity.Info);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [matchingBookWishes, setMatchingBookWishes] = useState<IBookWish[]>([]);
    const [grantedBookWishes, setGrantedBookWishes] = useState<IBookWish[]>([]);

    useEffect(() => {
        setIsExistingBook(true);
        setBookBeforeChanges({...initialBookState});

        // Edit page
        const urlParamId = parseInt(params.id);
        if(urlParamId) {
            const tempBook = context.books.find(book => book.id === urlParamId && isOwner(book, authContext.account?.localAccountId));
            if(tempBook) {
                setIsExistingBook(true);
                setBook({...tempBook});
                setBookBeforeChanges({...tempBook});
            } else {
                setIsExistingBook(false);
                history.push(Paths.Overview);
            }
        }
        // Register from google page
        else if (location.state && Object.keys(location.state).length !== 0) {
            setIsExistingBook(false);
            if (location.state.book) {
                setBook(location.state.book);
                history.replace(Paths.Create, {});
            } else {
                setDisplayAlert(true);
                setAlertSeverity(AlertSeverity.Info);
            }
        }
        // Register empty page
        else if (!location.state) {
            setBook({...initialBookState});
            setIsExistingBook(false);
        } else {
            setIsExistingBook(false);
        }
    }, [location.state, params]);

    const resetInputFields = () => {
        if (isExistingBook) {
            setBookBeforeChanges(book);
        } else {
            setBook({...initialBookState});
            setBookBeforeChanges({...initialBookState});
        }
    };

    const submitBook = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
        event.preventDefault();

        try {
            if (isExistingBook) {
                context.updateBook(book);
            } else {
                context.addBook(book).then(response => setAddedBook({...response}));

                const matchingWishes = context.bookwishes.filter(bw =>
                    bw.title.toLowerCase().includes(book.title.toLowerCase())
                    || book.title.toLowerCase().includes(bw.title.toLowerCase())
                    || bw.title.toLowerCase().split(" ").some(bwWord =>
                        book.title.toLowerCase().split(" ").some(bWord => bWord === bwWord))
                    || bw.authors.split(", ").some(bwAuthor =>
                        book.authors.some(bAuthor => bAuthor.name === bwAuthor)));
                setMatchingBookWishes(matchingWishes);
            }
            resetInputFields();
            setAlertSeverity(AlertSeverity.Success);
            setDisplayDialog(true);
        }
        catch (error) {
            setDisplayAlert(true);
            setAlertSeverity(AlertSeverity.Error);
        }
    };

    const confirmBook = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> => {
        event.preventDefault();
        try {
            grantedBookWishes.forEach(bw => {
                context.removeBookWish(bw);
            });
            setDisplayDialog(false);
            if (isExistingBook) {
                history.goBack();
            } else {
                history.replace(Paths.Details.replace(":id", addedBook.id.toString()));
            }
        }
        catch (error) {
            setDisplayAlert(true);
            setAlertSeverity(AlertSeverity.Error);
        }
    };

    const onChangeWishGranted = (event: React.ChangeEvent<HTMLInputElement>, bookWish: IBookWish) => {
        if (event.target.checked) {
            setGrantedBookWishes(grantedBookWishes.concat(bookWish));
        } else {
            setGrantedBookWishes(grantedBookWishes.filter(bw => bw !== bookWish));
        }

    };

    if(isExistingBook && !book.title) {
        return <NoContentFound />;
    }

    return (
        <>
            <Snackbar open={displayAlert} autoHideDuration={5000} onClose={() => setDisplayAlert(false)}>
                <Alert severity={alertSeverity} onClose={() => setDisplayAlert(false)}>
                    {translate(`${alertSeverity}AlertSave`)}
                </Alert>
            </Snackbar>

            <Dialog
                open={displayDialog}
                onClose={() => setDisplayDialog(false)}
                aria-describedby="alert-dialog-description"
                aria-labelledby="alert-dialog-title"
                fullWidth={true}
            >
                <DialogTitle id="alert-dialog-title">{book.title}{addedBook.title} - {translate(`${alertSeverity}AlertSave`)}</DialogTitle>
                {matchingBookWishes.length > 0 ? (
                    <DialogContent id="alert-dialog-description">
                        <DialogContentText>
                            {matchingBookWishes.length == 1 ? translate("foundOneMatchingWish") : translate("foundMultipleMatchingWishes")}
                        </DialogContentText>
                        {matchingBookWishes.map((bookWish, i) => (
                            <Grid container spacing={1} key={i}>
                                <Grid item xs={12}>
                                    <Paper elevation={3} className={`${classes.smallPaper} ${classes.fullHeight}`}>
                                        <Grid container direction="row" className={classes.fullHeight}>
                                            <Grid item container direction="column" xs={12} sm={8}>
                                                <Typography variant="overline" >{bookWish.title} {translate("by")} {bookWish.authors}</Typography>
                                                <Typography variant="caption">{bookWish.comment}</Typography>
                                            </Grid>
                                            <Grid item container xs={12} sm={4}>
                                                <Tooltip title={translate("removeWishTooltip")}>
                                                    <FormControlLabel
                                                        control={<Checkbox size="small" onChange={(event) => onChangeWishGranted(event, bookWish)} />}
                                                        label={translate("wishGranted")}
                                                    />
                                                </Tooltip>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            </Grid>
                        ))}
                    </DialogContent>) :
                    <></>}
                <DialogActions>
                    <Button
                        onClick={() => {
                            grantedBookWishes.forEach(bw => {
                                context.removeBookWish(bw);
                            });
                            setDisplayDialog(false);}}
                        color="primary">
                        {isExistingBook ? translate("continueChange") : translate("registerNewBook")}
                    </Button>
                    <Button onClick={confirmBook} color="secondary" autoFocus>
                        {translate("OK")}
                    </Button>
                </DialogActions>
            </Dialog>

            {book && <EditBookForm
                book={book}
                setBook={setBook}
                isExistingBook={isExistingBook}
                submitBook={submitBook}
                bookBeforeChanges={bookBeforeChanges}
            />}
        </>
    );
};

export default BookRegistrationForm;
