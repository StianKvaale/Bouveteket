import { Container } from "@material-ui/core";
import React from "react";
import { MyLoans } from "../components/MyLoans";


const LoansPage = (): JSX.Element => {
    return (
        <Container fixed >
            <MyLoans />
        </Container>
    );

};

export default LoansPage;