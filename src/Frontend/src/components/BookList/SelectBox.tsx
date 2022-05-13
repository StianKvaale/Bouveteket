import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import React, { useContext } from "react";
import { LanguageContext } from "store/languageContext";

interface SelectBoxProps {
    options: string[];
    selectedValue: string;
    setSelectedValue: (selectedValue: string) => void;
    setPage: (page:number) => void;
}

export const SelectBox = ({options, selectedValue, setSelectedValue, setPage}: SelectBoxProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);

    return (
        <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="select-box-label">{translate("sort")}</InputLabel>
            <Select
                MenuProps={{
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "center"
                    },
                    transformOrigin: {
                        vertical: "top",
                        horizontal: "center"
                    },
                    getContentAnchorEl: null
                }}
                value={selectedValue}
                labelId="select-box-label"
                label={translate("sort")}
                fullWidth
                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                    setSelectedValue(event.target.value as string);
                    setPage(0);
                }}>
                {options.map((option) => {
                    return <MenuItem key={option} value={option}>{translate(option)}</MenuItem>;
                })}
            </Select>
        </FormControl>
    );
};