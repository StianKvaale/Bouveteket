import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { useStyles } from 'styles';

export const LoadingSpinner = (): JSX.Element => {
    const classes = useStyles();
    return (
        <div className={classes.progressContainer}>
            <CircularProgress size={60} color={"secondary"} />
        </div>
    );
};

export default LoadingSpinner;