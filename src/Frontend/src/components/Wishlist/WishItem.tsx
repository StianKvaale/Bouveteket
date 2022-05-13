import { Avatar, Badge, Button, Dialog, DialogActions, DialogContent, DialogContentText, Grid, IconButton, Paper, Tooltip, Typography } from "@material-ui/core";
import { ThumbUp } from "@material-ui/icons";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "store/appContext";
import { AuthContext } from "store/authContext";
import { LanguageContext } from "store/languageContext";
import { IBookWish } from "store/types";
import { useStyles } from "styles";

interface WishItemProps {
    bookWish: IBookWish;
}

export  const WishItem = ({bookWish}: WishItemProps): JSX.Element => {
    const { dispatch: { translate }} = useContext(LanguageContext);
    const appContext = useContext(AppContext);
    const authContext = useContext(AuthContext);
    const classes = useStyles();
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        setHasVoted(bookWish.voters.some(voterId => voterId === authContext.account?.localAccountId) );
    }, [bookWish.voters, authContext.account]);

    const onVote = () => {
        if (!hasVoted && authContext.account?.localAccountId) {
            appContext.updateBookWish({
                ...bookWish,
                voters: bookWish.voters.concat([authContext.account?.localAccountId])
            }).then(() => setHasVoted(true));
        } else if (authContext.account?.localAccountId) {
            appContext.updateBookWish({
                ...bookWish,
                voters: bookWish.voters.filter(voterId => !(voterId === authContext.account?.localAccountId))
            }).then(() => setHasVoted(false));
        }
    };

    return (
        <>
            <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={3} className={`${classes.paper} ${classes.fullHeight}`}>
                    <Grid container direction="row" className={classes.fullHeight}>
                        <Grid item container xs={7} direction="column">
                            <Typography variant="h5" >{bookWish.title}</Typography>
                            <Typography variant="overline" gutterBottom>{translate("by")} {bookWish.authors}</Typography>
                            <Typography variant="subtitle2">{translate("originalWisher")}:</Typography>
                            <Typography variant="subtitle2" gutterBottom>{bookWish.username}</Typography>
                            <Typography variant="body2">{bookWish.comment}</Typography>
                        </Grid>
                        <Grid item container xs={5} justify="space-between" direction="column" alignItems="flex-end">
                            <Tooltip title={hasVoted ? translate("removeVote") : translate("addVote")}>
                                <Badge
                                    overlap="circle"
                                    badgeContent={
                                        <Avatar className={classes.smallAvatar}>
                                            {bookWish.votes}
                                        </Avatar>
                                    }>
                                    <Avatar className={classes.largeAvatar}>
                                        <IconButton
                                            aria-label={hasVoted ? translate("removeVote") : translate("addVote")}
                                            onClick={() => onVote()}>
                                            <ThumbUp color={hasVoted ? "secondary" : "inherit"} />
                                        </IconButton >
                                    </Avatar>
                                </Badge>
                            </Tooltip>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setIsDialogOpen(true)}>
                                {translate("removeWish")}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}>
                <DialogContent>
                    <DialogContentText>
                        {translate("confirmRemoveWish")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setIsDialogOpen(false)}
                        color="primary">
                        {translate("cancel")}
                    </Button>
                    <Button
                        onClick={() => {
                            appContext.removeBookWish(bookWish);
                            setIsDialogOpen(false);
                        }}
                        color="primary"
                        autoFocus>
                        {translate("yes")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
