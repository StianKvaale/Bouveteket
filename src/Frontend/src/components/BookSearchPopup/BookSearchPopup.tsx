import { Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, TextField, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { Search } from "@material-ui/icons";
import ClearIcon from '@material-ui/icons/Clear';
import { Pagination } from "@material-ui/lab";
import { LoadingSpinner } from "components/LoadingSpinner/LoadingSpinner";
import { Paths } from "config/enums";
import React, { useContext, useState } from "react";
import { useHistory } from "react-router";
import { AppContext } from "store/appContext";
import { LanguageContext } from "store/languageContext";
import { IBook } from "store/types";
import { useStyles } from "styles";
import { searchGoogleBooks } from "utils/helpers";


interface BookSearchPopupProps {
    visible: boolean;
    setVisible: (display: boolean) => void;
    onBookSelected: (display: IBook) => void;
}

export const BookSearchPopup = ({visible, setVisible, onBookSelected}: BookSearchPopupProps): JSX.Element => {
    const context = useContext(AppContext);
    const { dispatch: { translate }} = useContext(LanguageContext);
    const theme = useTheme();
    const classes = useStyles();
    const history = useHistory();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<IBook[]>([]);
    const [apiGoogleResponded, setApiGoogleResponded] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [pages, setPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const itemsPerPage = 6;

    const handleBookSearch = () => {
        if(!searchQuery) return;
        const searchQueryLower = searchQuery.toLowerCase();
        setHasSearched(true);
        setApiGoogleResponded(false);
        let books = context.books.filter(book => book.active).filter(book => book.title.toLowerCase().includes(searchQueryLower)
                                            || book.ean.includes(searchQueryLower)
                                            || book.subTitle.toLowerCase().includes(searchQueryLower)
                                            || book.description.toLowerCase().includes(searchQueryLower)
                                            || book.authors.filter(author => author.name.toLowerCase().includes(searchQueryLower)).length > 0
                                            || book.categories.filter(category => category.title.toLowerCase().includes(searchQueryLower)).length > 0);
        searchGoogleBooks(searchQueryLower, false).then(booksFromGoogle => {
            if(booksFromGoogle) {
                books = books.concat(booksFromGoogle).filter((v,i,a) => a.findIndex(t => (t.ean === v.ean)) === i);
                setCurrentPage(1);
                setSearchResult(books);
                setPages(Math.ceil(books.length / itemsPerPage));
            } else {
                setSearchResult([]);
            }
            setApiGoogleResponded(true);
        });
    };

    const resetSearch = () => {
        setSearchQuery("");
        setSearchResult([]);
        setPages(0);
        setApiGoogleResponded(false);
        setHasSearched(false);
    };

    const onClose = () => {
        resetSearch();
        setVisible(false);
    };

    const currentBookResult = searchResult.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <Dialog
            open={visible}
            fullWidth={true}
            maxWidth={"lg"}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullScreen={useMediaQuery(theme.breakpoints.down('sm'))}
        >
            <DialogTitle id="alert-dialog-title">{translate("searchBook")}</DialogTitle>
            <DialogContent>
                <Typography>{translate("searchBooksInBouvetektAndGoogle")} </Typography>
                <Grid container className={classes.bookSearchPopupGrid}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={7} md={6}>
                            <TextField
                                autoFocus
                                fullWidth
                                label={translate("search")}
                                value={searchQuery}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                                variant="outlined"
                                margin="dense"
                                onKeyPress={(ev) => {
                                    if (ev.key === 'Enter') {
                                        handleBookSearch();
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="scan ean"
                                                onClick={() => handleBookSearch()}>
                                                <Search />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => resetSearch()}>
                                                <ClearIcon/>
                                            </IconButton >
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm container className={classes.columnToRow}>
                            <Grid item>
                                <Typography>{translate("foundNoFittingBook")}</Typography>
                            </Grid>
                            <Grid item>
                                <Button
                                    aria-label={translate("fillManually")}
                                    color="primary"
                                    onClick={() => {
                                        onClose();
                                        history.push({ pathname: Paths.Create });
                                    }}>
                                    {translate("fillManually")}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    {hasSearched && (apiGoogleResponded ? (
                        <Grid container direction="row" justify="space-between" spacing={3} className={classes.smallTopMargin}>
                            {currentBookResult.length > 0 ?
                                currentBookResult.map((book, i) => (
                                    <Grid item xs={12} sm={6} md={4} key={i}>
                                        <Card raised className={classes.registerBookSearchCard}>
                                            <CardContent>
                                                <Grid container direction="row" spacing={1}>
                                                    <Grid item xs={3}>
                                                        {book.imageUrl && <CardMedia component="img" src={book.imageUrl} alt={book.title} />}
                                                    </Grid>
                                                    <Grid item xs={9}>
                                                        <Grid  container justify="space-between">
                                                            <Typography variant="overline" color="textSecondary" >{isNaN(parseInt(book.ean)) ? "" : book.ean}</Typography>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => {
                                                                    onBookSelected(book);
                                                                    onClose();
                                                                }}>
                                                                {translate("select")}
                                                            </Button>
                                                        </Grid>
                                                        <Typography variant="h5" color="textPrimary">{book.title.slice(0, 40) + (book.title.length > 40 ? "..." : "")}</Typography>
                                                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>{book.authors.map((author, i) => (i ? ", " : "") + author.name)}</Typography>
                                                    </Grid>
                                                </Grid>

                                            </CardContent>

                                        </Card>
                                    </Grid>)
                                ) : (
                                    <Grid item xs={12}>
                                        {translate("foundNoBooksSearch")}
                                    </Grid>
                                )
                            }
                        </Grid>
                    ) : (
                        <LoadingSpinner/>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Grid container justify="center">
                    {pages > 0 && (
                        <Grid item className={classes.marginLeftAuto}>
                            <Pagination
                                count={pages}
                                page={currentPage}
                                onChange={(event, value) => setCurrentPage(value)}
                                size="small"
                                siblingCount={0}></Pagination>
                        </Grid>
                    )}
                    <Grid item className={classes.marginLeftAuto}>
                        <Button onClick={onClose} color="primary">{translate("close")}</Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
};

export default BookSearchPopup;