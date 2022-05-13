import { Container } from "@material-ui/core";
import React from "react";
import { MyData } from "../components/MyData";

const GdprPage = (): JSX.Element => {
    return (
        <Container fixed >
            <MyData />
        </Container>
    );
};

export default GdprPage;