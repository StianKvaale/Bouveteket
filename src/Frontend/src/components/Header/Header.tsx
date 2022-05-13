import { AppBar, Button, Container, Hidden, Toolbar, Typography } from "@material-ui/core";
import { Paths } from "config/enums";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "store/languageContext";
import { useStyles } from "styles";
import { AddBookMenu } from "./AddBookMenu";
import { ProfileMenu } from "./ProfileMenu";

interface HeaderProps {
    setBarcodeScannerPopupOpen: (display: boolean) => void;
    setBookSearchPopupOpen: (display: boolean) => void;
}

export const Header = ({setBarcodeScannerPopupOpen, setBookSearchPopupOpen}: HeaderProps): JSX.Element => {
    const classes = useStyles();
    const { dispatch: { translate }} = useContext(LanguageContext);

    return (
        <AppBar position="static" className={classes.appBar}>
            <Container>
                <Toolbar className={classes.removePadding}>
                    <Typography variant="h6">
                        <Link to={Paths.Overview} className={classes.link}>Bouveteket</Link>
                    </Typography>

                    <Button color="secondary" className={classes.headerButton} component={Link} to={Paths.Loans}>
                        {translate("myLoans")}
                    </Button>

                    <Hidden xsDown>
                        <AddBookMenu setBarcodeScannerPopupOpen={setBarcodeScannerPopupOpen} setBookSearchPopupOpen={setBookSearchPopupOpen} />
                        <Button color="secondary" className={classes.headerButton} component={Link} to={Paths.Wishes}>
                            {translate("wishlist")}
                        </Button>
                    </Hidden>

                    <div className={classes.userContainer}>
                        <ProfileMenu />
                    </div>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;