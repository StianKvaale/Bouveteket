import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Hidden, IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { DeleteForever } from "@material-ui/icons";
import { Alert, Rating } from "@material-ui/lab";
import { LoadingSpinner } from "components/LoadingSpinner/LoadingSpinner";
import { AlertSeverity, DateFormat, Paths } from "config/enums";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfilePicture, getUserInformation } from "services/msGraphService";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBook, IBookReview, IBookWish, IBorrowedBook, IMsGraphUser } from "store/types";
import { useStyles } from "styles";
import { getAuthorsText, isOwner } from "utils/bookUtils";

interface IMyBookReview extends IBookReview {
    bookTitle: string;
    bookAuthor: string;
}

export const MyData = (): JSX.Element => {
    const context = useContext(AppContext);
    const { dispatch: { translate }} = useContext(LanguageContext);
    const classes = useStyles();
    const authContext = useContext(AuthContext);
    const [myBorrowedBooks, setMyBorrowedBooks] = useState<IBorrowedBook[]>([]);
    const [myBooks, setMyBooks] = useState<IBook[]>([]);
    const [myWishes, setMyWishes] = useState<IBookWish[]>([]);
    const [myWishVotes, setMyWishVotes] = useState<IBookWish[]>([]);
    const [myReviews, setMyReviews] = useState<IMyBookReview[]>([]);
    const [profilePicture, setProfilePicture] = useState("");
    const [profileInformation, setProfileInformation] = useState<IMsGraphUser>();
    const [displayDialog, setDisplayDialog] = useState<boolean>(false);
    const [dialogContent, setDialogContent] = useState<string>("");
    const [displayAlert, setDisplayAlert] = useState<boolean>(false);
    const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>(AlertSeverity.Info);

    useEffect(() => {
        getProfilePicture().then(result => {
            setProfilePicture(result);
        });
        getUserInformation().then(result => {
            setProfileInformation(result);
        });
    }, []);

    useEffect(() => {
        if(authContext.account?.localAccountId){
            updateActiveBorrowedBooks();
            setMyBooks(context.books.filter(book => isOwner(book, authContext.account?.localAccountId)));
            setMyWishes(context.bookwishes.filter(wish => wish.username == authContext.account?.name));
            setMyWishVotes(context.bookwishes.filter(wish => wish.voters.some(voter => voter == authContext.account?.localAccountId)));
            setMyReviews(context.books.reduce((total: IMyBookReview[], book) => {
                const myBookReviews = book.bookReviews.filter(review => review.username == authContext.account?.name)
                    .reduce((total: IMyBookReview[], review) => {
                        const myReviewWithBookinfo = {...review, bookTitle: book.title, bookAuthor: getAuthorsText(book.authors, translate)};
                        return total.concat([myReviewWithBookinfo]);
                    }, []);
                return total.concat(myBookReviews);
            }, []));
        }
    }, [context.books, context.bookwishes]);

    const updateActiveBorrowedBooks = async () => {
        if(authContext.account?.localAccountId){
            await context.getMyBorrowedBooks()
                .then(response => setMyBorrowedBooks(response));
        }
    };

    const deleteAll = async ({ data = dialogContent, firstButton = false }) => {
        let result = true;
        if (authContext.account) {
            if (data === "myLoans") {
                if (firstButton) {
                    result = await context.removeMyLoans(true); // only my delivered loans
                } else {
                    result = await context.removeMyLoans(false); // all my loans
                }
            } else if (data === "myBooks") {
                if (firstButton) {
                    result = await context.removeAllMyBooks(true); // donate
                } else {
                    result = await context.removeAllMyBooks(false); // remove
                }
            } else if (data === "myWishes") {
                result = await context.removeMyBookWishes();
            } else if (data === "myWishVotes") {
                result = await context.removeMyBookWishVotes();
            } else if (data === "myBookReviews") {
                result = await context.removeMyBookReviews();
            } else if (data === "data") {
                await context.removeMyLoans(false).then(async response => {
                    result = response ? result : response;
                    await context.removeAllMyBooks(false).then(async response => {
                        result = response ? result : response;
                        await context.removeMyBookWishes().then(async response => {
                            result = response ? result : response;
                            await context.removeMyBookWishVotes().then(async response => {
                                result = response ? result : response;
                                await context.removeMyBookReviews().then(response => {
                                    result = response ? result : response;
                                    setAlertSeverity(result ? AlertSeverity.Success : AlertSeverity.Error);
                                });
                            });
                        });
                    });
                });
            } else if (data === "account") {
                await deleteAll({ data: "data" }).then(async () => {
                    result = await context.removeUserAndLogOut();
                });
            }
            setAlertSeverity(result ? AlertSeverity.Success : AlertSeverity.Error);
        } else {
            setAlertSeverity(AlertSeverity.Error);
        }
        setDisplayDialog(false);
        setDialogContent(data);
        setDisplayAlert(true);
    };

    if(context.isLoadingBooks){
        return <LoadingSpinner />;
    }

    return (
        <>
            <Snackbar open={displayAlert} autoHideDuration={5000} onClose={() => setDisplayAlert(false)}>
                <Alert severity={alertSeverity} onClose={() => setDisplayAlert(false)}>
                    {translate(`${alertSeverity}AlertDelete`)}
                    {alertSeverity === AlertSeverity.Error && (
                        translate(dialogContent).toLowerCase()
                    )}
                    {alertSeverity === AlertSeverity.Success && (
                        " - " + translate(dialogContent) + translate("wasDeleted")
                    )}
                </Alert>
            </Snackbar>

            <Dialog
                open={displayDialog}
                onClose={() => setDisplayDialog(false)}
                aria-describedby="alert-dialog-description"
                aria-labelledby="alert-dialog-title"
                fullWidth={true}
            >
                <DialogTitle id="alert-dialog-title">{translate("delete")} {translate(dialogContent).toLowerCase()}</DialogTitle>
                <DialogContent id="alert-dialog-description">
                    <DialogContentText>
                        {dialogContent === "account" ? (
                            <DialogContentText>{translate("confirmDelete")} {translate("accountAndData")} {translate("fromBouveteket")}?</DialogContentText>
                        ) : (
                            <DialogContentText>{translate("confirmDelete")} {translate("all").toLowerCase()} {translate(dialogContent).toLowerCase()} {translate("fromBouveteket")}?</DialogContentText>
                        )}
                        {(dialogContent === "myBooks" || dialogContent === "account") && (
                            <Typography variant="subtitle2">{translate("checkCanRemoveBooksText")}</Typography>
                        )}
                    </DialogContentText>
                    {dialogContent === "myBookReviews" && (
                        myReviews.map((review, i) => (
                            <Grid container spacing={1} key={i}>
                                <Grid item xs={12}>
                                    <Paper elevation={3} className={`${classes.smallPaper} ${classes.fullHeight}`}>
                                        <Grid container direction="row" className={classes.fullHeight}>
                                            <Grid item container direction="column" xs={12} sm={9}>
                                                <Typography variant="subtitle2" >{review.bookTitle} {translate("by")} {review.bookAuthor}</Typography>
                                                <Typography variant="overline" >{review.title}  {translate("by")}  {review.username}</Typography>
                                            </Grid>
                                            <Grid item container direction="column" xs={12} sm={3} alignItems="flex-end">
                                                <Typography variant="overline">{moment(review.dateAdded).format(DateFormat.NO)}</Typography>
                                                {review.rating && (
                                                    <Rating size="small" value={review.rating} readOnly />
                                                )}
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption">{review.comment}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDisplayDialog(false)} autoFocus>
                        {translate("cancel")}
                    </Button>
                    {dialogContent === "myBooks" && (
                        <Button color="secondary" onClick={() => deleteAll({firstButton: true})}>
                            {translate("donateBooksToBouveteket")}
                        </Button>
                    )}
                    {dialogContent === "myLoans" && (
                        <Button color="secondary" onClick={() => deleteAll({firstButton: true})}>
                            {translate("deleteDeliveredLoans")}
                        </Button>
                    )}
                    <Button color="secondary" onClick={() => deleteAll({})}>
                        {dialogContent === "account" ?
                            translate("delete") + " " + translate("accountAndData") :
                            translate("deleteAll") + " " + translate(dialogContent)}
                    </Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>{translate("myPersonalData")}</Typography>
                </Grid>

                <Hidden mdUp>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            {translate("GdprInfo")}
                            <Link to={{ pathname: translate("GdprLink") }} target="_blank" rel="noopener" className={classes.wikiLink}>
                                ({translate("GdprWiki")})
                            </Link>
                        </Typography>
                    </Grid>
                </Hidden>

                <Grid item xs={12} md={6}>
                    <Paper elevation={3} className={classes.myLoanTable}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={`${classes.tableHeader} ${classes.tableWidth40}`} colSpan={2} align="left">{translate("accountInfo")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className={classes.tableWidth40}>{translate("id")}</TableCell>
                                        <TableCell>{authContext.account?.localAccountId ?? ""}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("name")}</TableCell>
                                        <TableCell>{authContext.account?.name ?? ""}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("username")}</TableCell>
                                        <TableCell>{authContext.account?.username ?? ""}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("profilePicture")}</TableCell>
                                        <TableCell><Avatar alt={authContext.account?.name ?? ""} src={profilePicture} className={classes.popoverAvatar} /></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("department")}</TableCell>
                                        <TableCell>{profileInformation?.department}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("chosenLanguage")}</TableCell>
                                        <TableCell>{translate("selectedLanguage")}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("chosenStyleMode")}</TableCell>
                                        <TableCell>{authContext.user.useDarkMode ? translate("darkMode") : translate("lightMode")}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={2} align="right">
                                            <Button variant="contained"
                                                color="secondary"
                                                onClick={() => {
                                                    setDialogContent("account");
                                                    setDisplayDialog(true);}}>
                                                {translate("delete")} {translate("accountAndData")}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Hidden smDown>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            {translate("GdprInfo")}
                            <Link to={{ pathname: translate("GdprLink") }} target="_blank" rel="noopener" className={classes.wikiLink}>
                                ({translate("GdprWiki")})
                            </Link>
                        </Typography>
                    </Grid>
                </Hidden>

                <Grid item xs={12}>
                    <Paper elevation={3} className={classes.myLoanTable}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={classes.tableWidth35to70}></TableCell>
                                        <TableCell className={`${classes.tableHeader} ${classes.tableWidth27}`}>{translate("totalAmount")}</TableCell>
                                        <Hidden xsDown>
                                            <TableCell className={`${classes.tableHeader} ${classes.tableWidth27}`}>{translate("see")}</TableCell>
                                        </Hidden>
                                        <TableCell className={`${classes.tableHeader} ${classes.tableWidth27}`} align="right">{translate("deleteAll")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className={`${classes.tableCellLink} ${classes.tableHeader}`}>
                                            <Link to={Paths.Loans}>{translate("myLoans")}</Link>
                                        </TableCell>
                                        <TableCell>{myBorrowedBooks.length}</TableCell>
                                        <Hidden xsDown>
                                            <TableCell className={classes.tableCellLink}>
                                                <Link to={Paths.Loans}>{translate("see")} {translate("myLoans").toLowerCase()}</Link>
                                            </TableCell>
                                        </Hidden>
                                        <TableCell align="right">
                                            <Hidden smUp >
                                                <IconButton
                                                    aria-label="delete-my-loans"
                                                    className={classes.removePadding}
                                                    onClick={() => {
                                                        setDialogContent("myLoans");
                                                        setDisplayDialog(true);}} >
                                                    <DeleteForever color="secondary" fontSize="large"/>
                                                </IconButton>
                                            </Hidden>
                                            <Hidden xsDown >
                                                <Button variant="contained"
                                                    color="secondary"
                                                    onClick={() => {
                                                        setDialogContent("myLoans");
                                                        setDisplayDialog(true);}}>
                                                    {translate("delete")}
                                                </Button>
                                            </Hidden>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={`${classes.tableCellLink} ${classes.tableHeader}`}>
                                            <Link to={Paths.MyBooks}>{translate("myBooks")}</Link>
                                        </TableCell>
                                        <TableCell>{myBooks.length}</TableCell>
                                        <Hidden xsDown>
                                            <TableCell className={classes.tableCellLink}>
                                                <Link to={Paths.MyBooks}>{translate("see")} {translate("myBooks").toLowerCase()}</Link>
                                            </TableCell>
                                        </Hidden>
                                        <TableCell align="right">
                                            <Hidden smUp >
                                                <IconButton
                                                    aria-label="delete-my-books"
                                                    className={classes.removePadding}
                                                    onClick={() => {
                                                        setDialogContent("myBooks");
                                                        setDisplayDialog(true);}} >
                                                    <DeleteForever color="secondary" fontSize="large"/>
                                                </IconButton>
                                            </Hidden>
                                            <Hidden xsDown >
                                                <Button variant="contained"
                                                    color="secondary"
                                                    onClick={() => {
                                                        setDialogContent("myBooks");
                                                        setDisplayDialog(true);}}>
                                                    {translate("delete")}
                                                </Button>
                                            </Hidden>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={`${classes.tableCellLink} ${classes.tableHeader}`}>
                                            <Link to={Paths.Wishes}>{translate("myWishes")}</Link>
                                        </TableCell>
                                        <TableCell>{myWishes.length}</TableCell>
                                        <Hidden xsDown>
                                            <TableCell className={classes.tableCellLink}>
                                                <Link to={Paths.Wishes}>{translate("see")} {translate("allWishes")}</Link>
                                            </TableCell>
                                        </Hidden>
                                        <TableCell align="right">
                                            <Hidden smUp >
                                                <IconButton
                                                    aria-label="delete-my-wishes"
                                                    className={classes.removePadding}
                                                    onClick={() => {
                                                        setDialogContent("myWishes");
                                                        setDisplayDialog(true);}} >
                                                    <DeleteForever color="secondary" fontSize="large"/>
                                                </IconButton>
                                            </Hidden>
                                            <Hidden xsDown >
                                                <Button variant="contained"
                                                    color="secondary"
                                                    onClick={() => {
                                                        setDialogContent("myWishes");
                                                        setDisplayDialog(true);}}>
                                                    {translate("delete")}
                                                </Button>
                                            </Hidden>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className={`${classes.tableCellLink} ${classes.tableHeader}`}>
                                            <Link to={Paths.Wishes}>{translate("myWishVotes")}</Link>
                                        </TableCell>
                                        <TableCell>{myWishVotes.length}</TableCell>
                                        <Hidden xsDown>
                                            <TableCell className={classes.tableCellLink}>
                                                <Link to={Paths.Wishes}>{translate("see")} {translate("allWishes")}</Link>
                                            </TableCell>
                                        </Hidden>
                                        <TableCell align="right">
                                            <Hidden smUp >
                                                <IconButton
                                                    aria-label="delete-my-wish-votes"
                                                    className={classes.removePadding}
                                                    onClick={() => {
                                                        setDialogContent("myWishVotes");
                                                        setDisplayDialog(true);}} >
                                                    <DeleteForever color="secondary" fontSize="large"/>
                                                </IconButton>
                                            </Hidden>
                                            <Hidden xsDown >
                                                <Button variant="contained"
                                                    color="secondary"
                                                    onClick={() => {
                                                        setDialogContent("myWishVotes");
                                                        setDisplayDialog(true);}}>
                                                    {translate("delete")}
                                                </Button>
                                            </Hidden>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell
                                            className={classes.tableHeader}
                                            onClick={() => {
                                                setDialogContent("myBookReviews");
                                                setDisplayDialog(true);}}>
                                            {translate("myBookReviews")}
                                        </TableCell>
                                        <TableCell>{myReviews.length}</TableCell>
                                        <Hidden xsDown>
                                            <TableCell onClick={() => {
                                                setDialogContent("myBookReviews");
                                                setDisplayDialog(true);}}>
                                                {translate("see")} {translate("myBookReviews").toLowerCase()}
                                            </TableCell>
                                        </Hidden>
                                        <TableCell align="right">
                                            <Hidden smUp >
                                                <IconButton
                                                    aria-label="delete-my-reviews"
                                                    className={classes.removePadding}
                                                    onClick={() => {
                                                        setDialogContent("myBookReviews");
                                                        setDisplayDialog(true);}} >
                                                    <DeleteForever color="secondary" fontSize="large"/>
                                                </IconButton>
                                            </Hidden>
                                            <Hidden xsDown >
                                                <Button variant="contained"
                                                    color="secondary"
                                                    onClick={() => {
                                                        setDialogContent("myBookReviews");
                                                        setDisplayDialog(true);}}>
                                                    {translate("delete")}
                                                </Button>
                                            </Hidden>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell colSpan={3} align="right">
                                            <Button variant="contained"
                                                color="secondary"
                                                onClick={() => {
                                                    setDialogContent("data");
                                                    setDisplayDialog(true);}}>
                                                {translate("deleteAll")}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

            </Grid>
        </>
    );
};

export default MyData;