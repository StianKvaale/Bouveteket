import { Container } from "@material-ui/core";
import { BookRegistrationForm } from "components/BookRegistrationForm";
import React from "react";

const RegisterPage = (): JSX.Element => {
    return (
        <Container>
            <BookRegistrationForm />
        </Container>
    );
};

export default RegisterPage;