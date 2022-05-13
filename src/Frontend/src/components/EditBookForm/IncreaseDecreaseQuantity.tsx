import { Grid, IconButton, Typography } from "@material-ui/core";
import { AddBox, IndeterminateCheckBox } from "@material-ui/icons";
import React, { useContext } from "react";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { EditBookFormError, IBook } from "store/types";
import { tryGetOwnership } from "utils/bookUtils";

// COMPONENT FOR SETTING QUANTITY OF BOOKS, TOGGELING BETWEEN MY OWNED BOOKS AND TOTAL QUANTITY

interface IncreaseDecreaseQuantityProps {
    isOwnerChecked: boolean;
    book: IBook;
    setBook: (book: IBook) => void;
    error: EditBookFormError;
    setError: (error: EditBookFormError) => void;
}

export const IncreaseDecreaseQuantity = ({isOwnerChecked, book, setBook, error, setError}: IncreaseDecreaseQuantityProps): JSX.Element => {
    const authContext = useContext(AuthContext);
    const { dispatch: { translate }} = useContext(LanguageContext);

    const getDisplayedQuantity = () => {
        if(isOwnerChecked){
            const ownership = tryGetOwnership(book, authContext?.account?.localAccountId);
            if(ownership != null){
                return ownership.quantity;
            }
        }
        return book.quantity;
    };

    const decreaseQuantity = () => {
        addQuantity(-1);
    };

    const increaseQuantity = () => {
        addQuantity(1);
    };

    const addQuantity = (value: number) => {
        if(book == null){
            setError({...error, quantity: true});
            return;
        }

        const id = authContext.account?.localAccountId;
        if(id == null || id == ""){
            return;
        }

        const newTotalQty = book.quantity + value;
        const newAvailableQty = book.availableQuantity + value;
        const ownership = tryGetOwnership(book, authContext?.account?.localAccountId);

        let invalidChange = false;
        if(ownership != null){
            const ownershipQty = ownership.quantity + value;
            if(ownershipQty <= 0){
                invalidChange = true;
                return;
            }

            const index = book.owners.findIndex(o => o.userId === id);
            if (index != -1) {
                book.owners[index] = {
                    ...book.owners[index],
                    quantity: ownershipQty
                };
            }
        }

        if(invalidChange){
            return;
        }
        updateBookQuantity(newTotalQty, newAvailableQty);
    };

    const updateBookQuantity = (qty: number | undefined, availableQty: number | undefined) => {
        if(qty == null || qty < 0 || availableQty == null){
            setError({...error, quantity: true});
            return;
        }
        setBook({...book, quantity: qty, availableQuantity: availableQty});
    };

    return (
        <Grid item container alignItems="center">
            <Grid item xs={6}>
                <Typography>{(isOwnerChecked ? translate("setMyQuantity") : translate("setAddedQuantity"))}: </Typography>
            </Grid>
            <IconButton aria-label="decrease-quantity" onClick={() => decreaseQuantity()} >
                <IndeterminateCheckBox fontSize="large" />
            </IconButton>
            <Grid item>
                <Typography>{getDisplayedQuantity()}</Typography>
            </Grid>
            <IconButton aria-label="increase-quantity" onClick={() => increaseQuantity()} >
                <AddBox fontSize="large" />
            </IconButton>
        </Grid>
    );
};