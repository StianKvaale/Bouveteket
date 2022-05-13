import { Checkbox, FormControlLabel } from "@material-ui/core";
import React, { useContext } from "react";
import { SessionContext } from "store/sessionContext";

interface CheckboxWithLabelProps {
    label: string;
}

export const CheckboxWithLabel = ({label}: CheckboxWithLabelProps): JSX.Element => {
    const {isAvailableFilterChecked, onIsAvailableFilterChecked, setPage} = useContext(SessionContext);

    return (
        <FormControlLabel
            label={label}
            control={
                <Checkbox
                    checked={isAvailableFilterChecked}
                    onChange={() => {
                        onIsAvailableFilterChecked();
                        setPage(0);
                    }}
                    color="secondary"
                />}
        />);
};