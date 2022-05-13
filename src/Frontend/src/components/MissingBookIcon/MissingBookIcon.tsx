import MenuBookIcon from '@material-ui/icons/MenuBook';
import React from "react";
import { useStyles } from "styles";

export const MissingBookIcon = (): JSX.Element => {
    const classes = useStyles();
    return <MenuBookIcon className={classes.missingBookIcon} />;
};

export default MissingBookIcon;