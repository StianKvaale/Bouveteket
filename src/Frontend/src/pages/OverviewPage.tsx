import { Container } from "@material-ui/core";
import { BookList } from "components/BookList/BookList";
import React from "react";
import { useStyles } from "styles";

interface OverviewPageProps {
    setBarcodeScannerPopupOpen: (display: boolean) => void;
    setBookSearchPopupOpen: (display: boolean) => void;
}

const OverviewPage = ({...props}: OverviewPageProps): JSX.Element => {
    const classes = useStyles();

    return (
        <Container className={classes.largeSpacingBottomXs}>
            <BookList {...props} />
        </Container>
    );
};

export default OverviewPage;