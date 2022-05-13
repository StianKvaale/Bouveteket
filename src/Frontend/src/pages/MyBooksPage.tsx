import { Container } from "@material-ui/core";
import React from "react";
import { MyBooks } from "../components/MyBooks";

const MyBooksPage = (): JSX.Element => {
    return (
        <Container fixed >
            <MyBooks />
        </Container>
    );
};

export default MyBooksPage;