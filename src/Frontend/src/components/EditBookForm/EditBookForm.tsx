import LuxonUtils from '@date-io/luxon';
import { Button, CardMedia, Checkbox, FormControlLabel, Grid, IconButton, List, ListItem, ListItemText, Paper, Popover, Snackbar, TextField, Tooltip, Typography } from "@material-ui/core";
import { AddBox, IndeterminateCheckBox, Info } from '@material-ui/icons';
import { Alert } from "@material-ui/lab";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { CoverPhotoPopup } from "components/CoverPhotoPopup";
import { MissingBookIcon } from "components/MissingBookIcon";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { EditBookFormError, IBook } from "store/types";
import { useStyles } from "styles";
import { isNumbersOnly, isOwner, isValidEanStr, tryGetOwnership, tryRemoveOwnership } from "utils/bookUtils";
import { requiredFieldLabel } from "utils/helpers";
import { RouteLeavingGuard } from "../RouteLeavingGuard";
import { AutocompleteAuthors } from "./AutocompleteAuthors";
import { AutocompleteCategories } from "./AutocompleteCategories";
import { AutocompleteLanguages } from "./AutocompleteLanguages";

interface EditBookFormProps {
    book: IBook;
    setBook: React.Dispatch<React.SetStateAction<IBook>>;
    isExistingBook: boolean;
    submitBook(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void>;
    bookBeforeChanges: IBook;
}

export const EditBookForm = ({ book, setBook, isExistingBook, submitBook, bookBeforeChanges}: EditBookFormProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const authContext = useContext(AuthContext);
    const classes = useStyles();
    const history = useHistory();
    const [displayCoverPhotoPopup, setDisplayCoverPhotoPopup] = useState(false);
    const [imageMenuAnchor, setImageMenuAnchor] = useState<HTMLElement | null>(null);
    const [selectedDate, handleDateChange] = useState<Date | null>(book.published ? new Date(`${book.published}`) : null);
    const imageUploadRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<EditBookFormError>({
        title: false,
        authors: false,
        ean: false,
        quantity: false
    });
    const [displayAlert, setDisplayAlert] = useState(false);
    const [isOwnerChecked, setIsOwnerChecked] = useState(isOwner(book, authContext?.account?.localAccountId));
    const [addedQuantity, setAddedQuantity] = useState<number | undefined>();
    const [displayTooltip, setDisplayTooltip] = useState<boolean>(false);

    useEffect(() => {
        if (selectedDate === null) {
            handleDateChange(book.published ? new Date(`${book.published}`) : null);
        }
    }, [book.published]);

    useEffect(() => {
        setIsOwnerChecked(isOwner(book, authContext?.account?.localAccountId));
        if (isExistingBook && !addedQuantity) {
            setAddedQuantity(tryGetOwnership(book, authContext?.account?.localAccountId)?.quantity);
        } else if (!isExistingBook && !addedQuantity) {
            setAddedQuantity(1);
        }
    });

    useEffect(() => {
        if(book.quantity === 0){
            setBook({...book, quantity: 1, availableQuantity: 1});
        }
    }, [book.quantity]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (event?.target?.files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e?.target?.result && typeof(e.target.result) === "string") {
                    updateUploadedImage(e.target.result);
                } else {
                    updateUploadedImage();
                }
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const updateUploadedImage = (base64Image?: string) => {
        setBook({...book, imageUrl: base64Image});
    };

    const handleRemoveOwner = async (id: string) => {
        if (isOwnerChecked === false) {
            return;
        }
        if (!isOwner(book, authContext?.account?.localAccountId)) {
            setIsOwnerChecked(false);
            return;
        }
        if (tryRemoveOwnership(book, id)) {
            setIsOwnerChecked(false);
        }
    };

    const handleSetOwner = async (id: string) => {
        if (!addedQuantity) {
            setError({...error, quantity: true});
            return;
        }
        if(isOwnerChecked){
            return;
        }
        const ownerIndex = book.owners.findIndex(o => o.userId === id);
        if (ownerIndex != -1) { // if ownership already exists -> update quantity
            book.owners[ownerIndex] = {
                ...book.owners[ownerIndex],
                quantity: addedQuantity
            };
        } else { // if ownership does NOT exist -> add with correct quantity
            book.owners.push({
                id: "0",
                userId: id,
                bookId: book.id,
                quantity: addedQuantity
            });
        }
        setIsOwnerChecked(true);
    };

    const setIsOwner = async (): Promise<void> => {
        const newTogglerVal = !isOwnerChecked;
        const activeAccId = authContext?.account?.localAccountId || null;
        if(activeAccId == null){
            return;
        }

        if(newTogglerVal == false){
            return await handleRemoveOwner(activeAccId);
        }
        return await handleSetOwner(activeAccId);
    };

    const addQuantity = (value: number) => {
        const id = authContext.account?.localAccountId;
        if(book == null || addedQuantity == undefined || id == null || id == ""){
            setError({...error, quantity: true});
            return;
        }
        const newQuantity = addedQuantity + value;
        if (newQuantity <= 0) {
            return;
        }
        const newTotalQty = book.quantity + value;
        const newAvailableQty = book.availableQuantity + value;

        const ownerIndex = book.owners.findIndex(o => o.userId === id);
        if (ownerIndex != -1) { // if ownership exists -> update quantity
            book.owners[ownerIndex] = {
                ...book.owners[ownerIndex],
                quantity: newQuantity
            };
        }
        setAddedQuantity(newQuantity);
        updateBookQuantity(newTotalQty, newAvailableQty);
    };

    const updateBookQuantity = (qty: number | undefined, availableQty: number | undefined) => {
        if(qty == null || qty < 0 || availableQty == null){
            setError({...error, quantity: true});
            return;
        }
        setBook({...book, quantity: qty, availableQuantity: availableQty});
    };

    const onSubmitBook = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const validation = validateAllFields();
        if(validation) {
            submitBook(event);
            handleDateChange(null);
        } else {
            setDisplayAlert(true);
        }
    };

    const validateAllFields = () => {
        const title = book.title ? false : true;
        const ean = !isValidEanStr(book.ean);
        const authors = book.authors.length > 0 ? false : true;
        const quantity = book.quantity > 0 ? false : true;
        setError({
            ...error,
            title,
            ean,
            authors,
            quantity
        });
        return (!title && !ean && !authors && !quantity);
    };

    const renderImageMenu = () => {
        return (
            <div className={classes.imageMenu}>
                <Button variant="outlined" onClick={(event) => setImageMenuAnchor(event.currentTarget)}>
                    {translate("editImage")}
                </Button>

                <Popover
                    open={!!imageMenuAnchor}
                    anchorEl={imageMenuAnchor}
                    onClose={() => setImageMenuAnchor(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <List component="nav">
                        <ListItem button onClick={() => { setImageMenuAnchor(null); setDisplayCoverPhotoPopup(true); }}>
                            <ListItemText>{translate("takePhoto")}</ListItemText>
                        </ListItem>
                        <ListItem button onClick={() => { setImageMenuAnchor(null); imageUploadRef.current?.click(); }}>
                            <ListItemText>{translate("uploadImage")}</ListItemText>
                        </ListItem>
                        {book.imageUrl ? (<ListItem button onClick={() => { setImageMenuAnchor(null); updateUploadedImage(); }}>
                            <ListItemText>{translate("deleteImage")}</ListItemText>
                        </ListItem>) : null}
                    </List>
                </Popover>
                <input type="file" ref={imageUploadRef} hidden onChange={handleImageUpload} accept="image/*" />
            </div>
        );
    };

    const formHasUnsavedChanges = () => JSON.stringify(book) !== JSON.stringify(bookBeforeChanges);

    const setPublishedDate = (date: Date) => {
        if (date) {
            setBook({ ...book, published: parseInt(date.toString().slice(0,4)) || undefined });
        } else {
            setBook({ ...book, published: undefined });
        }
        handleDateChange(date);
    };

    return (
        <>
            <CoverPhotoPopup visible={displayCoverPhotoPopup} setVisible={setDisplayCoverPhotoPopup} setImageSource={updateUploadedImage} />

            <RouteLeavingGuard
                when={formHasUnsavedChanges()}
                navigate={(path) => history.push(path)} />

            <Snackbar open={displayAlert} autoHideDuration={5000} onClose={() => setDisplayAlert(false)}>
                <Alert severity="error" onClose={() => setDisplayAlert(false)}>
                    {translate("requiredFieldsMissing")}
                </Alert>
            </Snackbar>

            <form>
                <Typography variant="h5" gutterBottom>{isExistingBook ? translate("updateBook") : translate("registerNewBook")}</Typography>
                <Paper elevation={3} className={classes.paper}>
                    <Grid container direction="row" spacing={2}>
                        <Grid item xs={12} sm={6} lg={4}>
                            <Grid item xs={12}>
                                <TextField
                                    disabled={isExistingBook}
                                    error={error.title}
                                    helperText={error.title ? translate("titleRequired") : ""}
                                    label={requiredFieldLabel(translate("title"))}
                                    onBlur={() => {
                                        const title = book.title ? false : true;
                                        setError({...error, title});
                                    }}
                                    value={book.title}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBook({...book, title: event.target.value})}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label={translate("subTitle")}
                                    value={book.subTitle}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBook({ ...book, subTitle: event.target.value })}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth />
                            </Grid>
                            <AutocompleteAuthors book={book} setBook={setBook} error={error} setError={setError} />
                            <Grid item xs={12}>
                                <TextField
                                    disabled={isExistingBook}
                                    error={error.ean}
                                    helperText={error.ean ? translate("invalidEanMustBe10or13Digits") : ""}
                                    label={requiredFieldLabel(translate("ean"))}
                                    onBlur={() => {
                                        const ean = !isValidEanStr(book.ean);
                                        setError({...error, ean});
                                    }}
                                    value={isNumbersOnly(book.ean) ? book.ean : ""}
                                    type="string"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBook({...book, ean: event.target.value})}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />
                            </Grid>
                            <MuiPickersUtilsProvider utils={LuxonUtils}>
                                <Grid item xs={12}>
                                    <KeyboardDatePicker
                                        autoOk
                                        disableFuture
                                        disableToolbar
                                        views={["year"]}
                                        variant="inline"
                                        inputVariant="outlined"
                                        margin="dense"
                                        label={translate("published")}
                                        format="yyyy"
                                        placeholder="yyyy"
                                        value={selectedDate}
                                        InputAdornmentProps={{ position: "end" }}
                                        onChange={date => setPublishedDate(date)}
                                        maxDateMessage={translate("maxPublishedDate")}
                                        maxDate={new Date()}
                                        minDate={new Date(500, 0o1)}
                                        minDateMessage={translate("minPublishedDate")}
                                        invalidDateMessage={translate("invalidDateFormat")}
                                        fullWidth
                                        PopoverProps={{
                                            anchorOrigin: {vertical: "bottom", horizontal: "right"},
                                            transformOrigin: {vertical: "top", horizontal: "right"} }}
                                    />
                                </Grid>
                            </MuiPickersUtilsProvider>
                        </Grid>

                        <Grid item xs={12} sm={6} lg={4}>
                            <AutocompleteLanguages book={book} setBook={setBook} />
                            <Grid item xs={12}>
                                <TextField
                                    type="number"
                                    label={translate("amountOfPages")}
                                    value={book.pages ?? ""}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBook({ ...book, pages: parseInt(event.target.value) || undefined })}
                                    variant="outlined"
                                    margin="dense"
                                    inputProps={{min: 0, }}
                                    fullWidth />
                            </Grid>
                            <AutocompleteCategories book={book} setBook={setBook} />
                            <Grid item xs={12} className={classes.rlySmallTopMargin}>
                                <FormControlLabel
                                    control={<Checkbox checked={!isOwnerChecked} onChange={setIsOwner} name="donate"/>}
                                    label={translate("donateBooks")}
                                />
                                <Tooltip
                                    title={translate("donateBooksInfo")}
                                    interactive
                                    open={displayTooltip}
                                    onClose={() => setDisplayTooltip(false)}
                                    onOpen={() => setDisplayTooltip(true)}>
                                    <IconButton className={classes.marginRightRemove} aria-label="donateInfo" onClick={() => setDisplayTooltip(!displayTooltip)} >
                                        <Info />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid item container alignItems="center">
                                    <Grid item xs={6} sm="auto">
                                        <Typography>{translate("numberOfBookCopies")}: </Typography>
                                    </Grid>
                                    <Grid item className={classes.marginLeftAuto}>
                                        <Grid container justify="flex-end" alignItems="center" >
                                            <IconButton aria-label="decrease-quantity" onClick={() => addQuantity(-1)} >
                                                <IndeterminateCheckBox fontSize="large" />
                                            </IconButton>
                                            <Grid item>
                                                <Typography>{addedQuantity}</Typography>
                                            </Grid>
                                            <IconButton className={classes.marginRightRemove} aria-label="increase-quantity" onClick={() => addQuantity(1)} >
                                                <AddBox fontSize="large" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Grid container>
                                <Grid item xs={12} sm={6} lg={12}>
                                    <TextField
                                        label={translate("description")}
                                        value={book.description}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBook({ ...book, description: event.target.value })}
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth />
                                </Grid>
                                <Grid item  xs={12} sm={6} lg={12}>
                                    <Grid container spacing={2} justify="center">
                                        <Grid item xs={4}>
                                            {book.imageUrl ? (
                                                <CardMedia component="img"
                                                    className={classes.bookDetailsCoverImage}
                                                    src={book.imageUrl}
                                                    alt={book.title}
                                                />
                                            ) : <MissingBookIcon />}
                                        </Grid>
                                        <Grid item xs={5}>
                                            {renderImageMenu()}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid className={classes.topMargin}>
                        <Grid container justify="flex-end" spacing={2}>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => history.goBack()}>
                                    {translate("goBack")}
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    disabled={!Object.values(error).every(error => error === false)}
                                    variant="contained"
                                    color="secondary"
                                    onClick={(event) => onSubmitBook(event)}
                                    type="submit">
                                    {isExistingBook ? translate("update") : translate("add")}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            </form>
        </>
    );
};

export default EditBookForm;