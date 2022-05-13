import { Grid, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { AppContext } from "store/appContext";
import { LanguageContext } from "store/languageContext";
import { AddWishForm } from "./AddWishForm";
import { WishItem } from "./WishItem";

export const Wishlist = (): JSX.Element => {
    const { bookwishes } = useContext(AppContext);
    const { dispatch: { translate }} = useContext(LanguageContext);

    return (
        <Grid container direction="column" spacing={2}>
            {bookwishes.length > 0  ?
                (<Grid item container spacing={2}>
                    {bookwishes.map((bookWish, i) => (
                        <WishItem
                            key={i}
                            bookWish={bookWish}
                        />
                    ))}
                </Grid>) :
                (<Grid item><Typography>{translate("noWishes")}</Typography></Grid>)
            }
            <AddWishForm />
        </Grid>
    );
};

export default Wishlist;