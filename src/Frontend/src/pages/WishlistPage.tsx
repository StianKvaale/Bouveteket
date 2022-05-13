import { Container } from "@material-ui/core";
import { Wishlist } from "components/Wishlist";
import React from "react";

const WishlistPage = (): JSX.Element => {
    return (
        <Container>
            <Wishlist />
        </Container>
    );
};

export default WishlistPage;