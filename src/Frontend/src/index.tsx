import { ThemeProvider } from "@material-ui/styles";
import { App } from "App";
import { ScrollToTop } from "components/ScrollToTop";
import { darkTheme } from "config/themes";
import "index.css";
import React from "react";
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "reportWebVitals";
import { AuthProvider } from "store/authContext";
import { LanguageProvider } from "store/languageContext";

ReactDOM.render(
    <AuthProvider>
        <LanguageProvider>
            <ThemeProvider theme={darkTheme}>
                <BrowserRouter>
                    <ScrollToTop />
                    <App />
                </BrowserRouter>
            </ThemeProvider>
        </LanguageProvider>
    </AuthProvider>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
