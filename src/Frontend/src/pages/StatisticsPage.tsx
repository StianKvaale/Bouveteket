import { Container } from "@material-ui/core";
import { Statistics } from "components/Statistics";
import React from "react";

const StatisticsPage = (): JSX.Element => {
    return (
        <Container>
            <Statistics />
        </Container>
    );
};

export default StatisticsPage;