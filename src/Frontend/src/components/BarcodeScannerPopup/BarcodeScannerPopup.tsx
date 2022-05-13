import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Result } from "@zxing/library";
import React, { useContext, useEffect, useState } from "react";
import { LanguageContext } from "store/languageContext";
import { isValidEanStr } from "utils/bookUtils";
import { BarcodeScanner } from "../BarcodeScanner";

interface BarcodeScannerPopupProps {
    visible: boolean;
    setVisible: (value: boolean) => void;
    onBookFound: (result: string) => void;
}

export const BarcodeScannerPopup = ({visible, setVisible, onBookFound}: BarcodeScannerPopupProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const theme = useTheme();
    const [eanError, setEanError] = useState(false);
    const [foundBarcode, setFoundBarcode] = useState("");

    useEffect(() => {
        setEanError(!isValidEanStr(foundBarcode));
    }, [foundBarcode]);

    const handleOnClose = () => {
        setVisible(false);
        setFoundBarcode("");
    };

    return (
        <Dialog
            open={visible}
            onClose={() => handleOnClose()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullScreen={useMediaQuery(theme.breakpoints.down('sm'))}
        >
            <DialogTitle id="alert-dialog-title">{translate("scanBarcode")}</DialogTitle>
            <DialogContent>
                <BarcodeScanner
                    onUpdate={(err: unknown, result: Result | undefined) => {
                        if(result) {
                            const resultBarcode = result.getText();
                            if(resultBarcode) {
                                setFoundBarcode(resultBarcode);
                                if(isValidEanStr(resultBarcode)){
                                    onBookFound(resultBarcode);
                                    setVisible(false);
                                }
                            }
                        }
                    }}
                />
                {eanError && foundBarcode && <Alert severity="error">{foundBarcode + ". " + translate("invalidEanMustBe10or13Digits")}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleOnClose()} color="primary">{translate("close")}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BarcodeScannerPopup;