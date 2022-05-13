
import { Grid, Typography } from "@material-ui/core";
import InfoIcon from '@material-ui/icons/Info';
import React, { useContext } from "react";
import { LanguageContext } from "store/languageContext";
import { IBook } from "store/types";
import { useStyles } from "styles";

interface BookRentalStatusProps {
    book?: IBook | null;
}

export const BookRentalStatus = ({book}: BookRentalStatusProps): JSX.Element => {

    const classes = useStyles();
    const { dispatch: { translate }} = useContext(LanguageContext);
    const totalQty = book == null ? 0 : book.quantity;
    const availableQty = book == null ? 0 : book.availableQuantity;
    // const activeLoans = (book == null || book.activeLoans == null) ? [] : book.activeLoans;

    const getVailabilityDescription = () => {
        const borrowStr = translate(availableQty <= 0 ? "isUnavailable" : "isAvailable");
        const qtyStr = " ( " + (availableQty) + " / " + totalQty + " )";

        return borrowStr + qtyStr;
    };

    return (
        <Grid className={classes.centerVertical} container direction="column">
            <Grid item container direction="row" className={classes.smallSpacingBottom}>
                <InfoIcon className={(availableQty <= 0) ? classes.bookUnavailableIcon : classes.canBorrowBookIcon}/>
                <Typography className={`${classes.bookDetailStatusText}`}>
                    {getVailabilityDescription()}
                </Typography>
            </Grid>
            {/* If names of borrowers is to be displayed, type ILoan and logic backend has to be changed to accomodate this */}
            {/* {(availableQty <= 0) && activeLoans.map((loan, i) => (
                <Typography key={i} variant="caption" className={classes.headerButton}>{translate("to").toLowerCase()} {loan.username} {translate("from").toLowerCase()} {moment(loan?.dateBorrowed)?.format(DateFormat.NO)}</Typography>
            ))} */}
        </Grid>
    );
};

export default BookRentalStatus;