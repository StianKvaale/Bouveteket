import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { LoadingSpinner } from "components/LoadingSpinner";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBook, IBorrowedBook } from "store/types";
import { useStyles } from "styles";
import { isOwner } from "utils/bookUtils";

export const Statistics = (): JSX.Element => {
    const context = useContext(AppContext);
    const { dispatch: { translate }} = useContext(LanguageContext);
    const classes = useStyles();
    const authContext = useContext(AuthContext);
    const [myBorrowedBooks, setMyBorrowedBooks] = useState<IBorrowedBook[]>([]);
    const [myBooks, setMyBooks] = useState<IBook[]>([]);
    const [activeBooks, setActiveBooks] = useState<IBook[]>([]);
    const [avgPagesPerBook, setAvgPagesPerBook] = useState<number>(0);
    const [avgLoansPerPerson, setAvgLoansPerPerson] = useState<number>(0);
    const [topAuthors, setTopAuthors] = useState<[string, number][]>([]);
    const [topCategories, setTopCategories] = useState<[string, number][]>([]);

    useEffect(() => {
        if (authContext.account?.localAccountId) {
            updateActiveBorrowedBooks();
            setMyBooks(context.books.filter(book => isOwner(book, authContext?.account?.localAccountId)));
        }
        setActiveBooks(context.books.filter(b => b.active));
    }, [context.books, context.loans]);

    const updateActiveBorrowedBooks = async () => {
        if (authContext.account?.localAccountId) {
            await context.getMyBorrowedBooks()
                .then(response => setMyBorrowedBooks(response))
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    useEffect(() => {
        const categories: string[] = [];
        const authors: string[] = [];
        context.loans.map(loan => {
            const book = context.books.find(book => book.id === loan.bookId);
            book?.categories?.map(c => {
                categories.push(c.title);
            });
            book?.authors?.map(a => {
                authors.push(a.name);
            });
        });
        const countedCategories: [string, number][] = Array.from(new Set(categories)).map(c => [c, categories.filter(title => title === c).length]);
        const sortedCategories = countedCategories.sort((a, b) => b[1] - a[1]);
        setTopCategories(sortedCategories.slice(0, 3));
        const countedAuthors: [string, number][] = Array.from(new Set(authors)).map(a => [a, authors.filter(name => name === a).length]);
        const sortedAuthors = countedAuthors.sort((a, b) => b[1] - a[1]);
        setTopAuthors(sortedAuthors.slice(0, 3));

        setAvgPagesPerBook(activeBooks.reduce((total, book) => total + (book.pages ?? 0), 0) / activeBooks.filter(b => b.pages).length);
        setAvgLoansPerPerson(context.loans.filter(l => !l.dateDelivered).length / Array.from(new Set(context.loans.filter(l => !l.dateDelivered).map(loan => loan.userId))).length);
    }, [context.loans, activeBooks]);

    if(context.isLoadingBooks){
        return <LoadingSpinner />;
    }

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
                <Typography variant="h5" gutterBottom>{translate("statistics")} 🤓</Typography>
                <Paper elevation={3} className={classes.myLoanTable}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell className={`${classes.tableHeader} ${classes.tableWidth35}`}>{translate("totalAmount")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{translate("activeBooks")}</TableCell>
                                    <TableCell>{activeBooks.length}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("pagesInActiveBooks")}</TableCell>
                                    <TableCell>{activeBooks.reduce((total, book) => total + (book.pages ?? 0), 0)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("avgPagesPerBook")}</TableCell>
                                    <TableCell>{isNaN(avgPagesPerBook) ? 0 : avgPagesPerBook.toFixed(1)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("authorsRegistered")}</TableCell>
                                    <TableCell>{context.authors.length}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("categoriesRegistered")}</TableCell>
                                    <TableCell>{context.categories.length}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("loansMade")}</TableCell>
                                    <TableCell>{context.loans.length}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("currentLoans")}</TableCell>
                                    <TableCell>{context.loans.filter(l => !l.dateDelivered).length}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("avgLoansPerPerson")}</TableCell>
                                    <TableCell>{isNaN(avgLoansPerPerson) ? 0 : avgLoansPerPerson.toFixed(1)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("booksAddedPastWeek")}</TableCell>
                                    <TableCell>{activeBooks.filter(book => moment(book.dateAdded).diff(moment().subtract(1, "week")) > 0).length}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("booksAddedPastMonth")}</TableCell>
                                    <TableCell>{activeBooks.filter(book => moment(book.dateAdded).diff(moment().subtract(1, "months")) > 0).length}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>{translate("booksAddedPastYear")}</TableCell>
                                    <TableCell>{activeBooks.filter(book => moment(book.dateAdded).diff(moment().subtract(1, "year")) > 0).length}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>


            <Grid container item xs={12} sm={6} direction="column">
                <Grid item>
                    <Typography variant="h5" gutterBottom>{translate("personalStatistics")} 🤓</Typography>
                    <Paper elevation={3} className={classes.myLoanTable}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        <TableCell className={`${classes.tableHeader} ${classes.tableWidth35}`}>{translate("totalAmount")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>{translate("booksLent")}</TableCell>
                                        <TableCell>{myBorrowedBooks.length}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("currentLoans")}</TableCell>
                                        <TableCell>{myBorrowedBooks.filter(bb => !bb.dateDelivered).length}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("pagesRead")}</TableCell>
                                        <TableCell>{myBorrowedBooks.reduce((total, borrowedBook) => {
                                            const book = context.books.find(book => book.id === borrowedBook.bookId);
                                            return total + (book?.pages ?? 0);
                                        }, 0)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("addedBooks")}</TableCell>
                                        <TableCell>{myBooks.length}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>{translate("addedPages")}</TableCell>
                                        <TableCell>{myBooks.filter(b => b.active).reduce((total, book) => total + (book.pages ?? 0), 0)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h5">{translate("topAuthorsAndCategories")}</Typography>
                        <Typography variant="caption" gutterBottom>{translate("basedOnAllLoans")}</Typography>
                    </Grid>
                    <Grid item container xs={6}>
                        <Grid item container direction="column">
                            {topAuthors.length > 0 ? (
                                topAuthors.map((aut, i) => (
                                    <Grid item key={i}>
                                        <Skeleton variant="text" animation={false} className={classes.secondaryColor} height="2em" width={(aut[1]/topAuthors[0][1])*100 + "%"}/>
                                        <Typography variant="subtitle2">{aut[0]} ({aut[1]})</Typography>
                                    </Grid>
                                ))) :
                                <Typography variant="subtitle2">{translate("noAuthorsFound")}</Typography>
                            }
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <Grid item container direction="column">
                            {topCategories.length > 0 ? (
                                topCategories.map((cat, i) => (
                                    <Grid item key={i}>
                                        <Skeleton variant="text" animation={false} className={classes.secondaryColor} height="2em" width={(cat[1]/topCategories[0][1])*100 + "%"}/>
                                        <Typography variant="subtitle2">{cat[0]} ({cat[1]})</Typography>
                                    </Grid>
                                ))) :
                                <Typography variant="subtitle2">{translate("noCategoriesFound")}</Typography>
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Statistics;