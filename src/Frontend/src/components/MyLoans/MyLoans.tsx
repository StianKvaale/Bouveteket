import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Hidden, IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { DeleteForever, DeleteSweep, Done } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { LoadingSpinner } from "components/LoadingSpinner/LoadingSpinner";
import { AlertSeverity, DateFormat, Paths } from "config/enums";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBorrowedBook, ILoan } from "store/types";
import { useStyles } from "styles";
import { getAuthorsText } from "utils/bookUtils";

interface LocationState {
    displayAlert?: boolean;
  }

export const MyLoans = (): JSX.Element => {
    const context = useContext(AppContext);
    const { dispatch: { translate }} = useContext(LanguageContext);
    const classes = useStyles();
    const history = useHistory();
    const authContext = useContext(AuthContext);
    const location = useLocation<LocationState>();
    const [borrowedBooks, setBorrowedBooks] = useState<IBorrowedBook[]>([]);
    const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>(AlertSeverity.Info);
    const [displayAlert, setDisplayAlert] = useState<boolean>();
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [displayDialog, setDisplayDialog] = useState<boolean>(false);

    useEffect(() => {
        updateActiveBorrowedBooks();
    }, [context.books, context.loans]);

    const updateActiveBorrowedBooks = async () => {
        if(authContext.account?.localAccountId){
            await context.getMyBorrowedBooks()
                .then(response => setBorrowedBooks(response))
                .catch((err) => {
                    setAlertSeverity(AlertSeverity.Error);
                    setAlertMessage(`${AlertSeverity.Error}AlertLoan`);
                    setDisplayAlert(true);
                });
        }
    };

    useEffect(() => {
        if (location.state && Object.keys(location.state).length !== 0) {
            if (location.state.displayAlert) {
                setDisplayAlert(location.state.displayAlert);
                setAlertSeverity(AlertSeverity.Success);
                setAlertMessage(`${AlertSeverity.Success}AlertLoan`);
                history.replace(Paths.Loans, null);
            }
        } else {
            setDisplayAlert(false);
        }
    }, []);

    const returnBook = async (bookId: number) => {
        await context.onReturnBook(bookId)
            .then(() => {
                setAlertSeverity(AlertSeverity.Info);
                setAlertMessage(`${AlertSeverity.Info}AlertLoan`);
            })
            .catch(() => {
                setAlertSeverity(AlertSeverity.Error);
                setAlertMessage(`${AlertSeverity.Error}AlertLoan`);
            });
        setDisplayAlert(true);
    };

    const deleteLoan = async (loan?: ILoan) => {
        let result = false;
        if (loan) {
            result = await context.removeLoan(loan);
        } else {
            result = await context.removeMyLoans(true);
        }
        if (result) {
            setAlertSeverity(AlertSeverity.Success);
            setAlertMessage(`${AlertSeverity.Success}AlertDelete`);
        } else {
            setAlertSeverity(AlertSeverity.Error);
            setAlertMessage(`${AlertSeverity.Error}AlertDelete`);
        }
        setDisplayAlert(true);
    };

    if(context.isLoadingBooks){
        return <LoadingSpinner />;
    }

    return (
        <>
            <Snackbar open={displayAlert} autoHideDuration={5000} onClose={() => setDisplayAlert(false)}>
                <Alert severity={alertSeverity} onClose={() => setDisplayAlert(false)}>
                    {translate(alertMessage)}
                </Alert>
            </Snackbar>

            <Dialog
                open={displayDialog}
                onClose={() => setDisplayDialog(false)}
                aria-describedby="alert-dialog-description"
                aria-labelledby="alert-dialog-title"
                fullWidth={true}
            >
                <DialogTitle id="alert-dialog-title">{translate("deleteDeliveredLoans")}</DialogTitle>
                <DialogContent id="alert-dialog-description">
                    <DialogContentText>{translate("confirmDelete")} {translate("all").toLowerCase()} {translate("delivered").toLowerCase()} {translate("loans").toLowerCase()}?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button size="small" onClick={() => setDisplayDialog(false)} autoFocus>
                        {translate("cancel")}
                    </Button>
                    <Button size="small" color="secondary" onClick={async () => await deleteLoan()}>
                        {translate("delete")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Typography variant="h5" gutterBottom>{translate("currentLoans")}</Typography>
            {borrowedBooks.filter((loan) => !loan.dateDelivered).length > 0 ? (
                <Paper elevation={3} className={classes.myLoanTable}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={`${classes.tableHeader} ${classes.tableWidth35to70}`}>{translate("title")}</TableCell>
                                    <Hidden smDown>
                                        <TableCell className={`${classes.tableHeader} ${classes.tableWidth27}`}>{translate("author")}</TableCell>
                                    </Hidden>
                                    <TableCell className={classes.tableHeader}>{translate("lent")}</TableCell>
                                    <TableCell className={classes.tableHeader}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {borrowedBooks
                                    .filter((loan) => !loan.dateDelivered)
                                    .sort((a,b) => (a.dateBorrowed > b.dateBorrowed) ? -1 : 1)
                                    .map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell className={classes.tableCellLink}>
                                                <Link to={Paths.Details.replace(":id", loan.bookId.toString())}>{loan.title}</Link>
                                            </TableCell>
                                            <Hidden smDown>
                                                <TableCell>{getAuthorsText(loan.authors, translate)}</TableCell>
                                            </Hidden>
                                            <TableCell>{moment(loan.dateBorrowed).format(DateFormat.NO)}</TableCell>
                                            <TableCell>
                                                <Hidden smUp >
                                                    <IconButton
                                                        aria-label="deliver-loan"
                                                        className={classes.removePadding}
                                                        onClick={async () => await returnBook(loan.bookId)} >
                                                        <Done color="secondary" fontSize="large"/>
                                                    </IconButton>
                                                </Hidden>
                                                <Hidden xsDown >
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={async () => await returnBook(loan.bookId)}>
                                                        {translate("deliver")}
                                                    </Button>
                                                </Hidden>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : <span>{translate("noCurrentLoans")}</span> }

            <Typography variant="h5" gutterBottom className={classes.spacingTop}>{translate("previousLoans")}</Typography>
            {borrowedBooks.filter((book) => book.dateDelivered).length > 0 ? (
                <Paper elevation={3} className={classes.myLoanTable}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={`${classes.tableHeader} ${classes.tableWidth35to70}`}>{translate("title")} </TableCell>
                                    <Hidden smDown>
                                        <TableCell className={`${classes.tableHeader} ${classes.tableWidth27}`}>{translate("author")}</TableCell>
                                    </Hidden>
                                    <Hidden smUp >
                                        <TableCell className={`${classes.tableHeader}  ${classes.tableCellDouble}`}>
                                            <Typography variant="inherit">{translate("lent")}</Typography>
                                            <Typography variant="inherit">{translate("delivered")}</Typography>
                                        </TableCell>
                                    </Hidden>
                                    <Hidden xsDown >
                                        <TableCell className={classes.tableHeader}>{translate("lent")}</TableCell>
                                        <TableCell className={classes.tableHeader}>{translate("delivered")}</TableCell>
                                    </Hidden>
                                    <TableCell>
                                        <Hidden smUp >
                                            <IconButton
                                                aria-label="delete-all-loans"
                                                className={classes.removePadding}
                                                onClick={() => setDisplayDialog(true)} >
                                                <DeleteSweep color="secondary" fontSize="large"/>
                                            </IconButton>
                                        </Hidden>
                                        <Hidden xsDown >
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => setDisplayDialog(true)}>
                                                {translate("deleteAll")}
                                            </Button>
                                        </Hidden>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {borrowedBooks
                                    .filter((loan) => loan.dateDelivered)
                                    .sort((a,b) => ((a.dateDelivered ?? "") > (b.dateDelivered ?? "")) ? -1 : 1)
                                    .map((loan) => (
                                        <TableRow key={loan.id}>
                                            <TableCell className={classes.tableCellLink}>
                                                <Link to={Paths.Details.replace(":id", loan.bookId.toString())}>{loan.title}</Link>
                                            </TableCell>
                                            <Hidden smDown>
                                                <TableCell>{getAuthorsText(loan.authors, translate)}</TableCell>
                                            </Hidden>
                                            <Hidden smUp >
                                                <TableCell className={classes.tableCellDouble}>
                                                    <Typography variant="inherit">{moment(loan.dateBorrowed).format(DateFormat.NO)}</Typography>
                                                    <Typography variant="inherit">{moment(loan.dateDelivered).format(DateFormat.NO)}</Typography>
                                                </TableCell>
                                            </Hidden>
                                            <Hidden xsDown >
                                                <TableCell>{moment(loan.dateBorrowed).format(DateFormat.NO)}</TableCell>
                                                <TableCell>{moment(loan.dateDelivered).format(DateFormat.NO)}</TableCell>
                                            </Hidden>
                                            <TableCell>
                                                <Hidden smUp >
                                                    <IconButton
                                                        aria-label="delete-loan"
                                                        className={classes.removePadding}
                                                        onClick={async () => await deleteLoan(loan)} >
                                                        <DeleteForever color="secondary" fontSize="large"/>
                                                    </IconButton>
                                                </Hidden>
                                                <Hidden xsDown >
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={async () => await deleteLoan(loan)}>
                                                        {translate("delete")}
                                                    </Button>
                                                </Hidden>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : <span>{translate("noPreviousLoans")}</span> }
        </>
    );
};

export default MyLoans;