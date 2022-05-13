
import { Typography } from "@material-ui/core";
import { useStyles } from "components/NoContentFound/NoContentFoundStyles";
import { NoContentFoundMessage } from "config/enums";
import Penguin from "images/penguin.svg";
import React, { useContext } from "react";
import { AppContext } from "store/appContext";
import { LanguageContext } from "store/languageContext";


export const NoContentFound = (): JSX.Element => {
    const context = useContext(AppContext);
    const { dispatch: { translate }} = useContext(LanguageContext);
    const classes = useStyles();

    const messageType = context.apiError ?
        NoContentFoundMessage.ApiIsDown :
        NoContentFoundMessage.DidNotFindWhatYouWereLookingFor;

    const message = translate(messageType);

    return (
        <div className={classes.container}>
            <div className={classes.innerContainer}>
                <Typography variant="h2" className={classes.oopsHeader}>
                    {translate("oops")}</Typography>
                <Typography variant="subtitle1">
                    {message}
                </Typography>
                <img src={Penguin} alt={translate("penguin")} className={classes.penguinImage} />
            </div>
        </div>
    );

};
