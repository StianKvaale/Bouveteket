import { IconButton, InputAdornment, TextField } from '@material-ui/core';
import { Clear, CropFree, Search } from '@material-ui/icons';
import React, { useContext, useState } from 'react';
import { LanguageContext } from 'store/languageContext';
import { SessionContext } from 'store/sessionContext';
import { useStyles } from 'styles';
import { BarcodeScannerPopup } from '../BarcodeScannerPopup';

export const SearchField = (): JSX.Element => {
    const {searchQuery, setSearchQuery, setPage} = useContext(SessionContext);
    const { dispatch: { translate }} = useContext(LanguageContext);
    const classes = useStyles();
    const [displayScanBarcode, setDisplayScanBarcode] = useState(false);

    return (
        <>
            <BarcodeScannerPopup visible={displayScanBarcode} setVisible={setDisplayScanBarcode} onBookFound={(result) => setSearchQuery(result)} />

            <form noValidate autoComplete="off">
                <TextField
                    fullWidth
                    id="search"
                    label={translate("search")}
                    size="small"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(event) => {
                        setSearchQuery(event.target.value.toLowerCase());
                        setPage(0);
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="scan ean"
                                    onClick={() => setDisplayScanBarcode(true)}
                                    className={classes.searchIcon} >
                                    <CropFree className={classes.searchIcon} />
                                </IconButton >
                                {searchQuery == "" ?
                                    <IconButton
                                        aria-label="search"
                                        className={classes.searchIcon} >
                                        <Search className={classes.searchIcon} />
                                    </IconButton > :
                                    <IconButton
                                        aria-label="clear search"
                                        onClick={() => setSearchQuery("")}
                                        className={classes.searchIcon} >
                                        <Clear className={classes.searchIcon} />
                                    </IconButton >}
                            </InputAdornment>
                        )
                    }}
                />
            </form>
        </>
    );
};