import { Button, Hidden, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { DeleteForever } from "@material-ui/icons";
import { ConfirmRemoveBookDialog } from "components/ConfirmRemoveBookDialog";
import { LoadingSpinner } from "components/LoadingSpinner";
import { DateFormat, Paths, SortOptions } from "config/enums";
import moment from "moment";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBook } from "store/types";
import { useStyles } from "styles";
import { getAuthorsText, getOwnedAmountOrZero, isOwner } from "utils/bookUtils";
import { sortBooks } from "utils/helpers";

export const MyBooks = (): JSX.Element => {
    const context = useContext(AppContext);
    const { dispatch: { translate }} = useContext(LanguageContext);
    const classes = useStyles();
    const authContext = useContext(AuthContext);
    const myBooks = context.books?.filter(book => isOwner(book, authContext?.account?.localAccountId));
    const [displayDialog, setDisplayDialog] = useState<boolean>(false);
    const [chosenBook, setChosenBook] = useState<IBook|undefined>();

    if(context.isLoadingBooks){
        return <LoadingSpinner />;
    }

    return (
        <>
            <ConfirmRemoveBookDialog
                displayDialog={displayDialog}
                setDisplayDialog={setDisplayDialog}
                chosenBook={chosenBook} />

            <Typography variant="h5" gutterBottom>{translate("addedBooks")}</Typography>
            {myBooks.length > 0 ? (
                <Paper elevation={3} className={classes.myLoanTable}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell className={`${classes.tableHeader} ${classes.tableWidth35to70}`}>{translate("title")}</TableCell>
                                    <Hidden smDown>
                                        <TableCell className={`${classes.tableHeader} ${classes.tableWidth35}`}>{translate("author")}</TableCell>
                                    </Hidden>
                                    <Hidden xsDown >
                                        <TableCell className={classes.tableHeader}>{translate("dateAdded")}</TableCell>
                                    </Hidden>
                                    <TableCell className={classes.tableHeader}>{translate("userOwnedAmt")}</TableCell>
                                    <TableCell className={classes.tableHeader}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortBooks(SortOptions.Title, myBooks)
                                    .map((book) => (
                                        <TableRow key={book.id}>
                                            <TableCell className={classes.tableCellLink}>
                                                <Link to={Paths.Details.replace(":id", book.id.toString())}>{book.title}</Link>
                                            </TableCell>
                                            <Hidden smDown>
                                                <TableCell>{getAuthorsText(book.authors, translate)}</TableCell>
                                            </Hidden>
                                            <Hidden xsDown>
                                                <TableCell>{moment(book.dateAdded).format(DateFormat.NO)}</TableCell>
                                            </Hidden>
                                            <TableCell>{getOwnedAmountOrZero(book, authContext.account?.localAccountId)}</TableCell>
                                            <TableCell>
                                                <Hidden smUp >
                                                    <IconButton
                                                        aria-label="delete-book"
                                                        className={classes.removePadding}
                                                        onClick={() => {setChosenBook(book); setDisplayDialog(true);}} >
                                                        <DeleteForever color="secondary" fontSize="large"/>
                                                    </IconButton>
                                                </Hidden>
                                                <Hidden xsDown >
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={() => {setChosenBook(book); setDisplayDialog(true);}}>
                                                        {translate("removeBook")}
                                                    </Button>
                                                </Hidden>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : <span>{translate("noAddedBooks")}</span>}
        </>
    );
};

export default MyBooks;