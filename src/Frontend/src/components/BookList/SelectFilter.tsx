import { Checkbox, Chip, TextField } from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { Autocomplete } from "@material-ui/lab";
import React, { useContext } from "react";
import { SessionContext } from "store/sessionContext";
import { useStyles } from 'styles';

interface SelectFilterProps {
    allFilterOptions: string[];
    filterText: string;
    selectedFilter: string[];
    setSelectedFilter: (selectedFilter: string[]) => void;
}

export const SelectFilter = ({allFilterOptions, filterText, selectedFilter, setSelectedFilter}: SelectFilterProps): JSX.Element => {
    const { setPage } = useContext(SessionContext);
    const classes = useStyles();

    const uniqueFilterOptions = Array.from(new Set(allFilterOptions)).sort((a, b) => a?.toLowerCase() > b?.toLowerCase() ? 1 : -1);

    return (
        <Autocomplete
            multiple
            id={"select-filter-" + filterText}
            options={uniqueFilterOptions}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            fullWidth
            value={selectedFilter}
            onChange={(event, value) => {
                setSelectedFilter(value);
                setPage(0);
            }}
            renderOption={(option, { selected }) => (
                <>
                    <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        checked={selected}
                    />
                    {option}
                </>
            )}
            renderTags={(value, getTagProps) => (
                <>
                    {value
                        .slice(0, 2)
                        .map((option, index) =>
                            <Chip {...getTagProps({index})} size="small" label={option} key={index} className={classes.selectFilterChip} />
                        )}
                    {value.length > 2 && `+${value.length - 2}`}
                </>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label={filterText}
                    size="small"/>
            )}
        />
    );
};
