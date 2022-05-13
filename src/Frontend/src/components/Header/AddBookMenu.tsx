import { Button, List, ListItem, ListItemIcon, ListItemText, Popover } from "@material-ui/core";
import { Create, CropFree } from "@material-ui/icons";
import React, { useContext, useState } from "react";
import { LanguageContext } from "store/languageContext";
import { useStyles } from "styles";

interface AddBookMenuProps {
    setBarcodeScannerPopupOpen: (display: boolean) => void;
    setBookSearchPopupOpen: (display: boolean) => void;
}

export const AddBookMenu = ({setBarcodeScannerPopupOpen, setBookSearchPopupOpen}: AddBookMenuProps): JSX.Element => {
    const classes = useStyles();
    const { dispatch: { translate }} = useContext(LanguageContext);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    return <>
        <Button aria-describedby="popover" color="secondary" className={classes.headerButton} onClick={event => setAnchorEl(event.currentTarget)}>
            {translate("addBook")}
        </Button>

        <Popover
            id="popover"
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            className={classes.headerPopover}
        >
            <List component="nav">
                <ListItem button
                    onClick={() => {
                        setBookSearchPopupOpen(true);
                        setAnchorEl(null);
                    }}>
                    <ListItemIcon className={classes.listItemIconSize}><Create /></ListItemIcon>
                    <ListItemText>{translate("addBook")}</ListItemText>
                </ListItem>
                <ListItem button
                    onClick={() => {
                        setBarcodeScannerPopupOpen(true);
                        setAnchorEl(null);
                    }}>
                    <ListItemIcon className={classes.listItemIconSize}><CropFree /></ListItemIcon>
                    <ListItemText>{translate("addWithBarcode")}</ListItemText>
                </ListItem>
            </List>
        </Popover>
    </>;
};

export default AddBookMenu;