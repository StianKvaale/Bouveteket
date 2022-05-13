import { CssBaseline, ThemeProvider } from "@material-ui/core";
import 'App.css';
import { BarcodeScannerPopup } from "components/BarcodeScannerPopup";
import { BookDetails } from "components/BookDetails";
import { BookSearchPopup } from "components/BookSearchPopup";
import { Header } from "components/Header";
import { Paths } from "config/enums";
import { darkTheme, lightTheme } from "config/themes";
import GdprPage from "pages/GdprPage";
import { LandingPage } from "pages/LandingPage";
import LoansPage from "pages/LoansPage";
import MyBooksPage from "pages/MyBooksPage";
import OverviewPage from "pages/OverviewPage";
import RegisterPage from "pages/RegisterPage";
import StatisticsPage from "pages/StatisticsPage";
import WishlistPage from "pages/WishlistPage";
import React, { useContext, useState } from 'react';
import { Route, Switch, useHistory } from "react-router-dom";
import { StateProvider } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageProvider } from "store/languageContext";
import { SessionProvider } from "store/sessionContext";
import { IBook } from "store/types";
import { searchGoogleBooks } from "utils/helpers";

export const App = (): JSX.Element => {
    const { isAuthenticated, user } = useContext(AuthContext);
    const history = useHistory();
    const theme = user.useDarkMode ? darkTheme : lightTheme;

    const [barcodeScannerPopupOpen, setBarcodeScannerPopupOpen] = useState(false);
    const [bookSearchPopupOpen, setBookSearchPopupOpen] = useState(false);

    if(!isAuthenticated){
        return <LandingPage />;
    }

    return (
        <LanguageProvider>
            <StateProvider>
                <SessionProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />

                        <Header setBarcodeScannerPopupOpen={setBarcodeScannerPopupOpen} setBookSearchPopupOpen={setBookSearchPopupOpen} />

                        <Switch>
                            <Route exact
                                path={Paths.Overview}
                                render={(props) => <OverviewPage {...props} setBarcodeScannerPopupOpen={setBarcodeScannerPopupOpen} setBookSearchPopupOpen={setBookSearchPopupOpen} />} />
                            <Route path={[Paths.Create, Paths.Edit]} component={RegisterPage} />
                            <Route path={Paths.Details} component={BookDetails} />
                            <Route path={Paths.Loans} component={LoansPage}/>
                            <Route path={Paths.MyBooks} component={MyBooksPage} />
                            <Route path={Paths.Statistics} component={StatisticsPage} />
                            <Route path={Paths.Wishes} component={WishlistPage} />
                            <Route path={Paths.Gdpr} component={GdprPage} />
                        </Switch>

                        <BarcodeScannerPopup
                            visible={barcodeScannerPopupOpen}
                            setVisible={setBarcodeScannerPopupOpen}
                            onBookFound={(result: string) =>
                                searchGoogleBooks(result, true).then(books => history.push({ pathname: Paths.Create, state: { book: books[0] }}))} />
                        <BookSearchPopup
                            visible={bookSearchPopupOpen}
                            setVisible={setBookSearchPopupOpen}
                            onBookSelected={(newBook: IBook) => history.push({ pathname: Paths.Create, state: { book: newBook }})} />
                    </ThemeProvider>
                </SessionProvider>
            </StateProvider>
        </LanguageProvider>
    );
};