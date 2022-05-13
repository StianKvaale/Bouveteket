import { Backdrop, ClickAwayListener, Grid, Hidden, TablePagination, useMediaQuery, useTheme } from "@material-ui/core";
import { Book, Create, CropFree } from "@material-ui/icons";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import { BookItem } from "components/BookItem";
import { LoadingSpinner } from "components/LoadingSpinner";
import { NoContentFound } from "components/NoContentFound";
import { Paths } from "config/enums";
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { AppContext } from "store/appContext";
import { LanguageContext } from "store/languageContext";
import { SessionContext } from "store/sessionContext";
import { useStyles } from "styles";
import { sortBooks } from "utils/helpers";
import { BookFilter } from "./BookFilter";

interface BookListProps {
    setBarcodeScannerPopupOpen: (value: boolean) => void;
    setBookSearchPopupOpen: (value: boolean) => void;
}

export const BookList = ({setBarcodeScannerPopupOpen, setBookSearchPopupOpen}: BookListProps): JSX.Element => {
    const context = useContext(AppContext);
    const sessionContext = useContext(SessionContext);
    const history = useHistory();
    const classes = useStyles();
    const { dispatch: { translate }} = useContext(LanguageContext);
    const [speedDialOpen, setSpeedDialOpen] = useState(false);
    const initialRowsPerPage = 15;
    const theme = useTheme();
    const mdUp = useMediaQuery(theme.breakpoints.up('md'));

    let books = context.books.filter(book => book.active).filter(book => book.title.toLowerCase().includes(sessionContext.searchQuery)
                                            || book.ean.includes(sessionContext.searchQuery)
                                            || book.subTitle.toLowerCase().includes(sessionContext.searchQuery)
                                            || book.description.toLowerCase().includes(sessionContext.searchQuery)
                                            || book.authors.filter(author => author.name.toLowerCase().includes(sessionContext.searchQuery)).length > 0
                                            || book.categories.filter(category => category.title.toLowerCase().includes(sessionContext.searchQuery)).length > 0);

    books = sessionContext.isAvailableFilterChecked ? books.filter(book => book.availableQuantity > 0) : books;
    if (sessionContext.selectedCategoryFilter.length > 0) {
        books = books.filter(book =>
            sessionContext.selectedCategoryFilter.some(categoryFilter =>
                book.categories.some(category => category.title === categoryFilter)
            )
        );
    }
    if (sessionContext.selectedAuthorFilter.length > 0) {
        books = books.filter(book =>
            sessionContext.selectedAuthorFilter.some(authorFilter =>
                book.authors.some(author => author.name === authorFilter)
            )
        );
    }
    if (sessionContext.selectedLanguageFilter.length > 0) {
        books = books.filter(book =>
            sessionContext.selectedLanguageFilter.some(languageFilter =>
                book.language === languageFilter
            )
        );
    }
    books = sortBooks(sessionContext.selectedSortOption, books);

    if(context.isLoadingBooks){
        return <LoadingSpinner />;
    }

    if(context.books.length === 0){
        return <NoContentFound />;
    }

    return (
        <>
            <BookFilter/>

            <Grid container spacing={2}>
                {books.length > 0 ?
                    ((sessionContext.rowsPerPage > 0 ?
                        books.slice(sessionContext.page * sessionContext.rowsPerPage, sessionContext.page * sessionContext.rowsPerPage + sessionContext.rowsPerPage)
                        : books
                    ).map(book =>
                        <BookItem
                            key={book.id}
                            book={book}
                        />
                    )) :
                    <Grid item xs={12}>{translate("foundNoBooksSearch")}</Grid>}
            </Grid>

            <Grid container justify="center">
                {books.length > initialRowsPerPage && (
                    <TablePagination
                        className={classes.noBorder}
                        rowsPerPageOptions={mdUp ? [initialRowsPerPage, initialRowsPerPage*2, initialRowsPerPage*3, { label: translate("all"), value: books.length }] : []}
                        count={books.length}
                        rowsPerPage={mdUp ? sessionContext.rowsPerPage : initialRowsPerPage*2}
                        page={sessionContext.page}
                        labelRowsPerPage={translate("rowsPerPage")}
                        labelDisplayedRows={({ from, to, count }) => (`${translate("shows")} ${from} - ${to} ${translate("of")} ${count}`)}
                        onChangePage={(event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
                            sessionContext.setPage(newPage);
                            window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
                        }}
                        onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, ) => {
                            sessionContext.setRowsPerPage(parseInt(event.target.value, 10));
                            sessionContext.setPage(0);
                        }}
                    />)}
            </Grid>

            <Hidden mdUp>
                <Backdrop open={speedDialOpen} className={classes.backdrop} />
            </Hidden>

            <ClickAwayListener onClickAway={() => setSpeedDialOpen(false)}>
                <SpeedDial
                    ariaLabel="Add book menu"
                    icon={<SpeedDialIcon />}
                    open={speedDialOpen}
                    onClick={() => setSpeedDialOpen(!speedDialOpen)}
                    className={classes.speedDial}
                    FabProps={{ color: "secondary" }}
                >
                    <SpeedDialAction
                        icon={<Book />}
                        classes={{
                            staticTooltip: classes.speedDialAction
                        }}
                        tooltipTitle={translate("addBookWish")}
                        tooltipOpen
                        onClick={() => history.push(Paths.Wishes)}
                    />
                    <SpeedDialAction
                        icon={<CropFree />}
                        classes={{
                            staticTooltip: classes.speedDialAction
                        }}
                        tooltipTitle={translate("addWithBarcode")}
                        tooltipOpen
                        onClick={() => setBarcodeScannerPopupOpen(true)}
                    />
                    <SpeedDialAction
                        icon={<Create />}
                        classes={{
                            staticTooltip: classes.speedDialAction
                        }}
                        tooltipTitle={translate("addBook")}
                        tooltipOpen
                        onClick={() => setBookSearchPopupOpen(true)}
                    />
                </SpeedDial>
            </ClickAwayListener>
        </>
    );
};

export default BookList;