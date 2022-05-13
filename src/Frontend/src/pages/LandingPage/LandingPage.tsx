import { Button, CircularProgress, Grid, Typography, withStyles } from "@material-ui/core";
import { useStyles } from "pages/LandingPage/landingPageStyles";
import React, { useContext } from "react";
import { AuthContext } from "store/authContext";

const LandingPage = (): JSX.Element => {
    const {login, isUserLoggedInTaskDone} = useContext(AuthContext);
    const classes = useStyles();

    const WhiteTextTypography = withStyles({
        root: {
            color: "#FFFFFF",
            width: "100vh",
            textAlign: "center"
        }
    })(Typography);

    const WhiteTextButton = withStyles({
        root: {
            color: "#FFFFFF",
            borderColor: "#FFFFFF",
            whiteSpace: "nowrap"
        }
    })(Button);

    if(!isUserLoggedInTaskDone){
        return <div className={classes.loadingContainer}><CircularProgress /></div>;
    }

    return (
        <Grid container  alignItems="center" justify="flex-start" className={classes.landingPageGrid}>
            <Grid item xs={12} className={classes.bulbCoverImage}/>
            <Grid item xs={12} className={`${classes.welcomeMessageItem} ${classes.centeredGridItem}`}>
                <WhiteTextTypography display="inline" variant="h4" >
                    Bouveteket har åpnet.
                </WhiteTextTypography>
            </Grid>
            <Grid item xs={12} className={`${classes.joinButtonItem} ${classes.centeredGridItem}`}>
                <WhiteTextButton variant="outlined" size="large"  onClick={login}>
                    Bli med
                </WhiteTextButton>
            </Grid>
        </Grid>

    );
};

export default LandingPage;