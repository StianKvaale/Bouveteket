import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import { Location } from "history";
import React, { useContext, useEffect, useState } from "react";
import { Prompt } from "react-router-dom";
import { LanguageContext } from "store/languageContext";

interface RouteLeavingGuardProps {
    when: boolean;
    navigate: (path: string) => void;
}

export const RouteLeavingGuard = ({when, navigate}: RouteLeavingGuardProps): JSX.Element => {
    const [open, setOpen] = useState(false);
    const [lastLocation, setLastLocation] = useState<Location | null>(null);
    const [confirmedNavigation, setConfirmedNavigation] = useState(false);
    const { dispatch: { translate }} = useContext(LanguageContext);

    const handleBlockedNavigation = (nextLocation: Location): boolean => {
        if (!confirmedNavigation && when) {
            setOpen(true);
            setLastLocation(nextLocation);
            return false;
        }
        return true;
    };

    const handleConfirmNavigationClick = () => {
        setOpen(false);
        setConfirmedNavigation(true);
    };

    useEffect(() => {
        if (confirmedNavigation && lastLocation) {
            navigate(lastLocation.pathname);
            setConfirmedNavigation(false);
        }
    }, [confirmedNavigation, lastLocation]);

    return (
        <>
            <Prompt when={when} message={handleBlockedNavigation} />
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle id="alert-dialog-title">{translate("areYouSureYouWantToLeavePage")}</DialogTitle>
                <DialogContent>{translate("allDataWillBeGone")}</DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpen(false)}>
                        {translate("cancel")}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleConfirmNavigationClick}>
                        {translate("yes")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RouteLeavingGuard;