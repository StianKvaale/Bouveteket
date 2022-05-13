import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Tooltip } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { AlertSeverity } from "config/enums";
import React, { useContext, useState } from "react";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBook } from "store/types";
import { getAuthorsText, getOwnedAmountOrZero, isOwner } from "utils/bookUtils";

interface DialogProps {
    chosenBook: IBook | undefined;
    displayDialog: boolean;
    setDisplayDialog: (display: boolean) => void;
    setBookNotActive?: (notActive: boolean) => void;
}

export const ConfirmRemoveBookDialog = ({ chosenBook, displayDialog, setDisplayDialog, setBookNotActive }: DialogProps): JSX.Element => {
    const context = useContext(AppContext);
    const { dispatch: { translate }} = useContext(LanguageContext);
    const authContext = useContext(AuthContext);
    const [displayAlert, setDisplayAlert] = useState<boolean>(false);
    const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>(AlertSeverity.Info);

    const canRemoveBook = (book : IBook | undefined): boolean => {
        if(book == null || !isOwner(book, authContext?.account?.localAccountId)){
            return false;
        }
        return book.availableQuantity >= getOwnedAmountOrZero(book, authContext?.account?.localAccountId);
    };

    const donateBook = async () => {
        if (chosenBook) {
            const result = await context.donateBook(chosenBook);
            setAlertSeverity(result ? AlertSeverity.Success : AlertSeverity.Error);
            setDisplayDialog(result ? false : true);
        } else {
            setAlertSeverity(AlertSeverity.Error);
        }
        setDisplayAlert(true);
    };

    const removeBook = async () => {
        if (chosenBook) {
            const result = await context.removeBook(chosenBook);
            setAlertSeverity(result ? AlertSeverity.Success : AlertSeverity.Error);
            setDisplayDialog(result ? false : true);
            if (result?.active == false) {
                setBookNotActive && setBookNotActive(true);
            }
        } else {
            setAlertSeverity(AlertSeverity.Error);
        }
        setDisplayAlert(true);
    };

    return (
        <>
            <Snackbar open={displayAlert} autoHideDuration={5000} onClose={() => setDisplayAlert(false)}>
                <Alert severity={alertSeverity} onClose={() => setDisplayAlert(false)}>
                    {translate(`${alertSeverity}AlertDelete`)}
                </Alert>
            </Snackbar>

            <Dialog
                open={displayDialog}
                onClose={() => setDisplayDialog(false)}
                aria-describedby="alert-dialog-description"
                aria-labelledby="alert-dialog-title"
                fullWidth={true}
            >
                <DialogTitle id="alert-dialog-title">{translate("delete")} {chosenBook?.title}</DialogTitle>
                <DialogContent id="alert-dialog-description">
                    <DialogContentText>{translate("confirmDelete")} {chosenBook?.title} {translate("by")} {getAuthorsText(chosenBook?.authors, translate)} {translate("fromBouveteket")}?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button size="small" onClick={() => setDisplayDialog(false)} autoFocus>
                        {translate("cancel")}
                    </Button>
                    <Button size="small" color="secondary" onClick={() => donateBook()}>
                        {translate("donate")} {translate("to")} Bouveteket
                    </Button>
                    {canRemoveBook(chosenBook) ? (
                        <Button size="small" color="secondary" onClick={() => removeBook()}>
                            {translate("delete")} {translate("fromBouveteket")}
                        </Button>
                    ) : (
                        <Tooltip title={translate("isUnavailable")}>
                            <span>
                                <Button size="small" color="secondary" disabled>
                                    {translate("delete")} {translate("fromBouveteket")}
                                </Button>
                            </span>
                        </Tooltip>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );

};

export default ConfirmRemoveBookDialog;